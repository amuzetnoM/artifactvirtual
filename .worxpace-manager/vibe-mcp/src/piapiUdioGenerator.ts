import axios from "axios";
import {
  BaseAudioGenerator,
  AudioGenerationOptions,
  GenerationMode,
} from "./audioGenerator.js";

/**
 * Implementation of AudioGenerator using PiAPI's Udio API
 */
export class PiapiUdioGenerator extends BaseAudioGenerator {
  // apiKey and apiEndpoint are inherited from BaseAudioGenerator
  private mode: GenerationMode;

  /**
   * Create a new PiapiUdioGenerator
   * @param apiKey PiAPI API key (defaults to PIAPI_KEY env var)
   * @param apiEndpoint PiAPI task creation endpoint
   * @param mode Music generation mode (GenerationMode.Instrumental or GenerationMode.Lyrical)
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
    this.validateApiKey("PiAPI");
  }

  /**
   * Generate audio using the PiAPI Udio API
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

      // Determine lyrics_type based on mode
      const lyrics_type =
        mode === GenerationMode.Instrumental ? "instrumental" : "generate";

      const input = {
        prompt,
        ...(mode === GenerationMode.Lyrical
          ? {
              gpt_description_prompt: `Write a song based on the following code: ${options?.code}, describing what exactly what it's doing`,
            }
          : {}),
        lyrics_type: lyrics_type,
      };

      // Prepare the payload
      const payload = {
        model: "music-u",
        task_type: "generate_music",
        input,
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
      console.log(`Created PiAPI Udio task with ID: ${taskId}`);

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
      this.handleApiError(error, "PiAPI Udio");
    }
  }

  /**
   * Poll for the result of a task
   * @param taskId The task ID to poll for
   * @returns URL of the generated audio file
   */
  private async pollForResult(taskId: string): Promise<string> {
    const maxAttempts = 60; // Maximum number of polling attempts
    const pollingInterval = 5000; // Polling interval in milliseconds

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
