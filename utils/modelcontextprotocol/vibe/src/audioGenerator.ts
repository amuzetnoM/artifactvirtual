import path from "path";
import fs from "fs";
import os from "os";
import axios from "axios"; // Added for error handling
import { v4 as uuidv4 } from "uuid"; // Added for file saving

/**
 * Enum for music generation mode
 */
export enum GenerationMode {
  Instrumental = "instrumental",
  Lyrical = "lyrical",
}

/**
 * Options for audio generation
 */
export interface AudioGenerationOptions {
  duration?: number;
  genre?: string;
  steps?: number;
  mode?: GenerationMode;
  code?: string;
}

/**
 * Interface for audio generators
 * This allows us to easily swap out different audio generation services
 */
export interface AudioGenerator {
  /**
   * Generate audio based on a prompt
   * @param prompt The prompt to generate audio from
   * @param options Optional parameters for audio generation
   * @returns Path to the generated audio file (as a file:// URL)
   */
  generate(prompt: string, options?: AudioGenerationOptions): Promise<string>;
}

/**
 * Abstract base class for audio generators providing common cache setup
 */
export abstract class BaseAudioGenerator implements AudioGenerator {
  protected readonly audioCacheDir: string;
  protected readonly apiKey: string;
  protected readonly apiEndpoint: string;

  /**
   * Constructor for BaseAudioGenerator
   * @param apiKey API key for the service
   * @param apiEndpoint API endpoint for the service
   * @param audioCacheDir Directory to cache audio files (defaults to OS temp dir)
   */
  constructor(
    apiKey: string,
    apiEndpoint: string,
    audioCacheDir: string = path.join(os.tmpdir(), "vibe-cache")
  ) {
    this.apiKey = apiKey;
    this.apiEndpoint = apiEndpoint;
    this.audioCacheDir = audioCacheDir;
    this.setupCacheDirectory();
  }

  /**
   * Abstract method for generating audio - must be implemented by subclasses
   */
  abstract generate(
    prompt: string,
    options?: AudioGenerationOptions
  ): Promise<string>;

  /**
   * Validates the API key
   * @param serviceName Name of the service for error messages
   */
  protected validateApiKey(serviceName: string): void {
    if (!this.apiKey || this.apiKey === "your_api_key_here") {
      console.error(`Error: ${serviceName} API key is not set or invalid`);
      // Consider throwing an error or handling appropriately
    }
  }

  /**
   * Set up the audio cache directory
   * Creates the directory if it doesn't exist, or clears it if it does
   */
  protected setupCacheDirectory(): void {
    try {
      if (!fs.existsSync(this.audioCacheDir)) {
        // Create the directory if it doesn't exist
        fs.mkdirSync(this.audioCacheDir, { recursive: true });
        console.log(`Created audio cache directory: ${this.audioCacheDir}`);
      } else {
        // Clear the directory if it exists
        const files = fs.readdirSync(this.audioCacheDir);
        for (const file of files) {
          const filePath = path.join(this.audioCacheDir, file);
          try {
            fs.unlinkSync(filePath);
          } catch (error) {
            console.error(`Error deleting file ${filePath}:`, error);
          }
        }
        console.log(`Cleared audio cache directory: ${this.audioCacheDir}`);
      }
    } catch (error) {
      console.error("Error setting up audio cache directory:", error);
    }
  }

  /**
   * Saves audio data to a file in the cache directory
   * @param audioData The audio data buffer
   * @returns The file:// URL of the saved file
   */
  protected saveAudioToFile(audioData: Buffer): string {
    const fileName = `${uuidv4()}.mp3`; // Assuming mp3 for now
    const filePath = path.join(this.audioCacheDir, fileName);
    fs.writeFileSync(filePath, audioData);
    console.log(`Downloaded audio file to: ${filePath}`);
    return `file://${filePath}`;
  }

  /**
   * Handles API errors consistently
   * @param error The error object caught
   * @param serviceName Name of the service for error messages
   * @throws The original error after logging
   */
  protected handleApiError(error: unknown, serviceName: string): never {
    if (axios.isAxiosError(error)) {
      console.error(
        `${serviceName} API Error:`,
        error.response?.data || error.message
      );
    } else {
      console.error(`Error generating audio with ${serviceName}:`, error);
    }
    throw error;
  }
}

/**
 * Result of audio generation (Currently unused, kept for potential future use)
 */
export interface AudioGenerationResult {
  filePath: string;
  format: string;
  duration: number;
}
