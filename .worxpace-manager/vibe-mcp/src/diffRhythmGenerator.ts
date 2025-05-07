import axios from "axios";
import {
  BaseAudioGenerator,
  AudioGenerationOptions,
  GenerationMode,
} from "./audioGenerator.js";
import { DEFAULT_DURATION, DEFAULT_STEPS } from "./utils.js";

/**
 * Implementation of AudioGenerator using PiAPI's DiffRhythm API
 */
export class DiffRhythmGenerator extends BaseAudioGenerator {
  // apiKey and apiEndpoint are inherited from BaseAudioGenerator
  private mode: GenerationMode;

  /**
   * Create a new DiffRhythmGenerator
   * @param mode Music generation mode (GenerationMode.Instrumental or GenerationMode.Lyrical)
   * @param apiKey PiAPI API key (defaults to PIAPI_KEY env var)
   * @param apiEndpoint PiAPI task creation endpoint
   */
  constructor(
    mode: GenerationMode = GenerationMode.Instrumental,
    apiKey: string = process.env.PIAPI_KEY || "",
    apiEndpoint: string = "https://api.piapi.ai/api/v1/task"
  ) {
    // Pass apiKey and apiEndpoint to the base class constructor
    super(apiKey, apiEndpoint);
    this.mode = mode;
    // Validate the API key using the base class method
    this.validateApiKey("PiAPI DiffRhythm");
  }

  /**
   * Generate audio using the PiAPI DiffRhythm API
   * @param prompt The prompt to generate audio from
   * @param options Optional parameters for audio generation
   * @returns Path to the generated audio file
   */
  async generate(
    prompt: string,
    options?: AudioGenerationOptions
  ): Promise<string> {
    try {
      // Use provided mode or fall back to the instance mode
      const mode = options?.mode || this.mode;

      // Determine task type based on duration
      // txt2audio-base generates ~1.35 min, txt2audio-full generates ~4.45 min
      const duration = options?.duration || DEFAULT_DURATION;
      const taskType = duration > 200 ? "txt2audio-full" : "txt2audio-base";

      // Extract lyrics if in lyrical mode
      let lyrics = "";
      if (mode === GenerationMode.Lyrical) {
        // Simple extraction of potential lyrics from the prompt
        // In a real implementation, this would be more sophisticated
        const lines = prompt.split("\n");
        const lyricsLines = lines.filter(
          (line) =>
            !line.startsWith("Genre:") &&
            !line.startsWith("Mood:") &&
            !line.startsWith("Tempo:") &&
            !line.startsWith("Style:") &&
            !line.startsWith("Sentiment:") &&
            !line.startsWith("Inspiration:") &&
            !line.startsWith("Instrumentation:") &&
            !line.startsWith("The music should") &&
            !line.startsWith("CODE CONTEXT:")
        );

        // Format lyrics with timestamps as required by DiffRhythm API
        // This is a simplified implementation - in a real app, we'd need more sophisticated timestamp generation
        let currentTime = 10; // Start at 10 seconds
        lyrics = lyricsLines
          .map((line) => {
            const timestamp = `[${String(Math.floor(currentTime / 60)).padStart(
              2,
              "0"
            )}:${String(currentTime % 60).padStart(2, "0")}.00]`;
            currentTime += 7; // Add 7 seconds for each line
            return `${timestamp} ${line.trim()}`;
          })
          .join("\n");
      }

      // Extract style from prompt
      const genreMatch = prompt.match(/Genre: (.*?)(?:\n|$)/);
      const moodMatch = prompt.match(/Mood: (.*?)(?:\n|$)/);
      const genre = genreMatch ? genreMatch[1] : "";
      const mood = moodMatch ? moodMatch[1] : "";

      // Combine genre and mood for style prompt
      const stylePrompt = `${genre}${mood ? ", " + mood : ""}`;

      // Prepare the payload
      const payload = {
        model: "Qubico/diffrhythm",
        task_type: taskType,
        input: {
          lyrics: mode === GenerationMode.Lyrical ? lyrics : "",
          style_prompt: stylePrompt,
          style_audio: "", // Optional: could be used for reference audio
        },
        config: {
          webhook_config: {
            endpoint: "",
            secret: "",
          },
        },
      };

      // Make the API request to create a task
      const response = await axios.post(this.apiEndpoint, payload, {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey,
        },
      });

      // Check if the request was successful
      if (
        response.status !== 200 ||
        !response.data ||
        !response.data.data ||
        !response.data.data.task_id
      ) {
        throw new Error(
          `API error: ${response.status}: ${JSON.stringify(response.data)}`
        );
      }

      // Get the task ID
      const taskId = response.data.data.task_id;
      console.log(`Created PiAPI DiffRhythm task with ID: ${taskId}`);

      // Poll for the result
      const audioUrl = await this.pollForResult(taskId);

      // Download the file
      const fileResponse = await axios.get(audioUrl, {
        responseType: "arraybuffer",
      });

      // Save the audio data using the base class helper
      return this.saveAudioToFile(Buffer.from(fileResponse.data));
    } catch (error) {
      // Handle errors using the base class helper
      this.handleApiError(error, "PiAPI DiffRhythm");
    }
  }

  /**
   * Poll for the result of a task
   * @param taskId The task ID to poll for
   * @returns URL of the generated audio file
   */
  private async pollForResult(taskId: string): Promise<string> {
    const maxAttempts = 60; // Maximum number of polling attempts
    const pollingInterval = 3000; // Polling interval in milliseconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Make the API request to fetch the task status
        const response = await axios.get(`${this.apiEndpoint}/${taskId}`, {
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": this.apiKey,
          },
        });

        // Check if the task is complete
        if (
          response.data &&
          response.data.data &&
          response.data.data.status === "completed" &&
          response.data.data.output &&
          response.data.data.output.songs &&
          response.data.data.output.songs.length > 0 &&
          response.data.data.output.songs[0].song_path
        ) {
          console.log(`Task ${taskId} completed successfully`);
          return response.data.data.output.songs[0].song_path;
        }

        // If the task failed
        if (
          response.data &&
          response.data.data &&
          response.data.data.status === "failed"
        ) {
          throw new Error(
            `Task ${taskId} failed: ${JSON.stringify(response.data)}`
          );
        }

        // Wait before polling again
        console.log(`Task ${taskId} still processing, waiting...`);
        await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      } catch (error) {
        console.error(`Error polling for task ${taskId}:`, error);
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      }
    }

    throw new Error(`Timed out waiting for task ${taskId} to complete`);
  }
}
