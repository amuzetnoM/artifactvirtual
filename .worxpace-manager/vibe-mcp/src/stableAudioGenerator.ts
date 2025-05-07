import axios from "axios";
import {
  BaseAudioGenerator,
  AudioGenerationOptions,
} from "./audioGenerator.js";
import { DEFAULT_DURATION, DEFAULT_STEPS } from "./utils.js";

/**
 * Implementation of AudioGenerator using Stable Audio API
 */
export class StableAudioGenerator extends BaseAudioGenerator {
  // apiKey and apiEndpoint are inherited from BaseAudioGenerator

  /**
   * Create a new StableAudioGenerator
   * @param apiKey Stable Audio API key (defaults to STABLE_AUDIO_KEY env var)
   * @param apiEndpoint Stable Audio API endpoint (defaults to stable-audio-2 endpoint)
   */
  constructor(
    apiKey: string = process.env.STABLE_AUDIO_KEY || "",
    apiEndpoint: string = "https://api.stability.ai/v2beta/audio/stable-audio-2/text-to-audio"
  ) {
    // Pass apiKey and apiEndpoint to the base class constructor
    super(apiKey, apiEndpoint);
    // Validate the API key using the base class method
    this.validateApiKey("Stable Audio");
  }

  /**
   * Generate audio using the Stable Audio API
   * Note: Stable Audio only supports instrumental music generation.
   * The 'mode' parameter is accepted for interface compatibility but ignored.
   * @param prompt The prompt to generate audio from
   * @param options Optional parameters for audio generation
   * @returns Path to the generated audio file
   */
  async generate(
    prompt: string,
    options?: AudioGenerationOptions
  ): Promise<string> {
    try {
      // Prepare the payload
      const payload = {
        prompt: prompt,
        output_format: "mp3",
        duration: options?.duration || DEFAULT_DURATION,
        steps: options?.steps || DEFAULT_STEPS,
      };

      // Make the API request
      const response = await axios.postForm(
        this.apiEndpoint,
        axios.toFormData(payload),
        {
          validateStatus: undefined,
          responseType: "arraybuffer",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            Accept: "audio/*",
          },
        }
      );

      // Check if the request was successful
      if (response.status !== 200) {
        throw new Error(
          `API error: ${response.status}: ${response.data.toString()}`
        );
      }

      // Save the audio data using the base class helper
      return this.saveAudioToFile(Buffer.from(response.data));
    } catch (error) {
      // Handle errors using the base class helper
      this.handleApiError(error, "Stable Audio");
    }
  }
}
