import Speaker from "speaker";
import ffmpeg from "fluent-ffmpeg";
import { Readable, Transform } from "stream";
import fs from "fs";
import path from "path";
import { URL } from "url";

/**
 * Custom transform stream for volume control
 */
class VolumeTransform extends Transform {
  private volume: number;
  private channels: number;
  private bitDepth: number;

  /**
   * Create a new VolumeTransform
   * @param volume Initial volume (0-1)
   * @param channels Number of audio channels
   * @param bitDepth Bit depth (8, 16, 24, 32)
   */
  constructor(volume: number = 1, channels: number = 2, bitDepth: number = 16) {
    super();
    this.volume = volume;
    this.channels = channels;
    this.bitDepth = bitDepth;
  }

  /**
   * Set the volume
   * @param volume Volume level (0-1)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get the current volume
   * @returns Current volume level
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Transform the audio data by applying volume
   * @param chunk Audio data chunk
   * @param encoding Encoding
   * @param callback Callback function
   */
  _transform(chunk: Buffer, encoding: string, callback: Function): void {
    // If volume is 0 or 1, we can optimize
    if (this.volume === 0) {
      // Silence - create a buffer of zeros with the same length
      const silence = Buffer.alloc(chunk.length, 0);
      callback(null, silence);
      return;
    }

    if (this.volume === 1) {
      // Full volume - pass through unchanged
      callback(null, chunk);
      return;
    }

    // Create a new buffer for the transformed data
    const output = Buffer.alloc(chunk.length);

    // Apply volume based on bit depth
    if (this.bitDepth === 16) {
      // 16-bit audio (most common)
      for (let i = 0; i < chunk.length; i += 2) {
        // Read 16-bit sample (signed)
        const sample = chunk.readInt16LE(i);

        // Apply volume
        const adjusted = Math.round(sample * this.volume);

        // Write back, clamping to 16-bit range
        output.writeInt16LE(Math.max(-32768, Math.min(32767, adjusted)), i);
      }
    } else if (this.bitDepth === 8) {
      // 8-bit audio
      for (let i = 0; i < chunk.length; i++) {
        const sample = chunk.readInt8(i);
        const adjusted = Math.round(sample * this.volume);
        output.writeInt8(Math.max(-128, Math.min(127, adjusted)), i);
      }
    } else if (this.bitDepth === 24) {
      // 24-bit audio (3 bytes per sample)
      for (let i = 0; i < chunk.length; i += 3) {
        // Read 24-bit sample (3 bytes)
        const b1 = chunk[i];
        const b2 = chunk[i + 1];
        const b3 = chunk[i + 2];

        // Convert to signed 32-bit integer
        let sample = (b3 << 16) | (b2 << 8) | b1;
        if (sample & 0x800000) sample |= ~0xffffff; // Sign extension

        // Apply volume
        const adjusted = Math.round(sample * this.volume);

        // Clamp and write back
        const clamped = Math.max(-8388608, Math.min(8388607, adjusted));
        output[i] = clamped & 0xff;
        output[i + 1] = (clamped >> 8) & 0xff;
        output[i + 2] = (clamped >> 16) & 0xff;
      }
    } else if (this.bitDepth === 32) {
      // 32-bit audio (float)
      for (let i = 0; i < chunk.length; i += 4) {
        const sample = chunk.readFloatLE(i);
        const adjusted = sample * this.volume;
        output.writeFloatLE(adjusted, i);
      }
    }

    callback(null, output);
  }
}

/**
 * Interface for a player slot that manages an audio stream
 */
interface PlayerSlot {
  id: string;
  active: boolean;
  volume: number;
  speaker: Speaker | null;
  volumeTransform: VolumeTransform | null;
  ffmpegCommand: ffmpeg.FfmpegCommand | null;
  filePath: string | null;
}

/**
 * Class to manage audio playback with crossfading
 */
export class AudioPlayer {
  private playerA: PlayerSlot;
  private playerB: PlayerSlot;
  private fadeTime: number; // Fade time in milliseconds
  private fadeInterval: number; // Interval for fade steps in milliseconds
  private fadeTimer: NodeJS.Timeout | null = null;

  /**
   * Create a new AudioPlayer
   * @param fadeTime Fade time in milliseconds (default: 2000ms)
   * @param fadeInterval Interval for fade steps in milliseconds (default: 50ms)
   */
  constructor(fadeTime: number = 2000, fadeInterval: number = 50) {
    this.fadeTime = fadeTime;
    this.fadeInterval = fadeInterval;

    // Initialize player slots
    this.playerA = {
      id: "A",
      active: false,
      volume: 0,
      speaker: null,
      volumeTransform: null,
      ffmpegCommand: null,
      filePath: null,
    };

    this.playerB = {
      id: "B",
      active: false,
      volume: 0,
      speaker: null,
      volumeTransform: null,
      ffmpegCommand: null,
      filePath: null,
    };

    // Check if ffmpeg is installed
    this.checkFfmpegInstalled();
  }

  /**
   * Check if ffmpeg is installed on the system
   */
  private checkFfmpegInstalled(): void {
    ffmpeg.getAvailableFormats((err) => {
      if (err) {
        console.error("Error: FFmpeg is not installed or not in PATH");
        console.error(
          "Please install FFmpeg to enable audio playback: https://ffmpeg.org/download.html"
        );
      } else {
        console.log("FFmpeg is installed and available");
      }
    });
  }

  /**
   * Get the inactive player slot
   * @returns The inactive player slot, or the least recently used one if both are active
   */
  private getInactiveSlot(): PlayerSlot {
    if (!this.playerA.active) return this.playerA;
    if (!this.playerB.active) return this.playerB;

    // If both are active, return the one with lower volume (likely fading out)
    return this.playerA.volume <= this.playerB.volume
      ? this.playerA
      : this.playerB;
  }

  /**
   * Get the active player slot
   * @returns The active player slot with the highest volume, or null if none are active
   */
  private getActiveSlot(): PlayerSlot | null {
    if (!this.playerA.active && !this.playerB.active) return null;
    if (this.playerA.active && !this.playerB.active) return this.playerA;
    if (!this.playerA.active && this.playerB.active) return this.playerB;

    // If both are active, return the one with higher volume
    return this.playerA.volume >= this.playerB.volume
      ? this.playerA
      : this.playerB;
  }

  /**
   * Extract file path from a file URL
   * @param fileUrl The file URL (e.g., file:///path/to/file.mp3)
   * @returns The file path
   */
  private getFilePathFromUrl(fileUrl: string): string {
    try {
      const url = new URL(fileUrl);
      if (url.protocol !== "file:") {
        throw new Error(`Unsupported protocol: ${url.protocol}`);
      }
      return decodeURIComponent(url.pathname);
    } catch (error) {
      console.error("Error parsing file URL:", error);
      throw error;
    }
  }

  /**
   * Start playing an audio file
   * @param fileUrl The URL of the audio file to play
   * @param fadeIn Whether to fade in the audio (default: true)
   */
  async play(fileUrl: string, fadeIn: boolean = true): Promise<void> {
    try {
      const filePath = this.getFilePathFromUrl(fileUrl);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Get the inactive slot to use for this playback
      const slot = this.getInactiveSlot();
      const activeSlot = this.getActiveSlot();

      // Clean up the slot if it was previously used
      this.cleanupSlot(slot);

      // Set up the new slot
      slot.filePath = filePath;
      slot.active = true;
      slot.volume = fadeIn ? 0 : 1; // Start at 0 volume if fading in

      // Create a volume transform stream
      slot.volumeTransform = new VolumeTransform(slot.volume, 2, 16);

      // Create a new speaker
      slot.speaker = new Speaker({
        channels: 2,
        bitDepth: 16,
        sampleRate: 44100,
      });

      // Set up ffmpeg command
      slot.ffmpegCommand = ffmpeg(filePath)
        .noVideo()
        .audioCodec("pcm_s16le")
        .audioChannels(2)
        .audioFrequency(44100)
        .format("s16le")
        .on("error", (err) => {
          console.error(`FFmpeg error (${slot.id}):`, err);
          this.cleanupSlot(slot);
        })
        .on("end", () => {
          console.log(`Playback ended (${slot.id})`);
          this.cleanupSlot(slot);
        });

      // Start the playback with volume control
      // Pipe through the volume transform before sending to speaker
      slot.ffmpegCommand
        .pipe(slot.volumeTransform as any)
        .pipe(slot.speaker as any);

      console.log(`Started playback (${slot.id}): ${path.basename(filePath)}`);

      // If we need to fade in and there's an active slot, start crossfade
      if (fadeIn && activeSlot && activeSlot.active) {
        this.crossfade(activeSlot, slot);
      } else if (fadeIn) {
        // Just fade in the new track
        this.fadeIn(slot);
      }

      return Promise.resolve();
    } catch (error) {
      console.error("Error starting playback:", error);
      return Promise.reject(error);
    }
  }

  /**
   * Clean up a player slot
   * @param slot The player slot to clean up
   */
  private cleanupSlot(slot: PlayerSlot): void {
    if (slot.ffmpegCommand) {
      try {
        slot.ffmpegCommand.kill("SIGTERM");
      } catch (e) {
        console.error(`Error killing ffmpeg process (${slot.id}):`, e);
      }
      slot.ffmpegCommand = null;
    }

    if (slot.volumeTransform) {
      try {
        slot.volumeTransform.end();
      } catch (e) {
        console.error(`Error ending volume transform (${slot.id}):`, e);
      }
      slot.volumeTransform = null;
    }

    if (slot.speaker) {
      try {
        slot.speaker.end();
      } catch (e) {
        console.error(`Error ending speaker (${slot.id}):`, e);
      }
      slot.speaker = null;
    }

    slot.active = false;
    slot.volume = 0;
    slot.filePath = null;
  }

  /**
   * Fade in a player slot
   * @param slot The player slot to fade in
   */
  private fadeIn(slot: PlayerSlot): void {
    if (this.fadeTimer) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }

    const steps = this.fadeTime / this.fadeInterval;
    const volumeStep = 1 / steps;
    let currentStep = 0;

    this.fadeTimer = setInterval(() => {
      currentStep++;
      slot.volume = Math.min(1, currentStep * volumeStep);

      // Apply the volume to the transform stream
      if (slot.volumeTransform) {
        slot.volumeTransform.setVolume(slot.volume);
      }

      if (currentStep >= steps) {
        if (this.fadeTimer) {
          clearInterval(this.fadeTimer);
          this.fadeTimer = null;
        }
        slot.volume = 1;
        if (slot.volumeTransform) {
          slot.volumeTransform.setVolume(1);
        }
      }
    }, this.fadeInterval);
  }

  /**
   * Fade out a player slot
   * @param slot The player slot to fade out
   */
  private fadeOut(slot: PlayerSlot): void {
    const steps = this.fadeTime / this.fadeInterval;
    const volumeStep = 1 / steps;
    let currentStep = 0;

    const fadeOutTimer = setInterval(() => {
      currentStep++;
      slot.volume = Math.max(0, 1 - currentStep * volumeStep);

      // Apply the volume to the transform stream
      if (slot.volumeTransform) {
        slot.volumeTransform.setVolume(slot.volume);
      }

      if (currentStep >= steps) {
        clearInterval(fadeOutTimer);
        slot.volume = 0;
        if (slot.volumeTransform) {
          slot.volumeTransform.setVolume(0);
        }
        this.cleanupSlot(slot);
      }
    }, this.fadeInterval);
  }

  /**
   * Crossfade between two player slots
   * @param fromSlot The player slot to fade out
   * @param toSlot The player slot to fade in
   */
  private crossfade(fromSlot: PlayerSlot, toSlot: PlayerSlot): void {
    if (this.fadeTimer) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }

    const steps = this.fadeTime / this.fadeInterval;
    const volumeStep = 1 / steps;
    let currentStep = 0;

    this.fadeTimer = setInterval(() => {
      currentStep++;
      fromSlot.volume = Math.max(0, 1 - currentStep * volumeStep);
      toSlot.volume = Math.min(1, currentStep * volumeStep);

      // Apply the volume to both transform streams
      if (fromSlot.volumeTransform) {
        fromSlot.volumeTransform.setVolume(fromSlot.volume);
      }

      if (toSlot.volumeTransform) {
        toSlot.volumeTransform.setVolume(toSlot.volume);
      }

      if (currentStep >= steps) {
        if (this.fadeTimer) {
          clearInterval(this.fadeTimer);
          this.fadeTimer = null;
        }
        fromSlot.volume = 0;
        toSlot.volume = 1;

        if (fromSlot.volumeTransform) {
          fromSlot.volumeTransform.setVolume(0);
        }

        if (toSlot.volumeTransform) {
          toSlot.volumeTransform.setVolume(1);
        }

        this.cleanupSlot(fromSlot);
      }
    }, this.fadeInterval);
  }

  /**
   * Stop all playback
   */
  stop(): void {
    // Clean up both slots
    this.cleanupSlot(this.playerA);
    this.cleanupSlot(this.playerB);

    // Clear any active fade timer
    if (this.fadeTimer) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }

    console.log("All playback stopped");
  }
}

// Create and export a singleton instance
export const audioPlayer = new AudioPlayer();
