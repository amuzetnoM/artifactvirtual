#!/usr/bin/env node
import dotenv from "dotenv";
// Load environment variables from .env file
dotenv.config();

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { StableAudioGenerator } from "./stableAudioGenerator.js";
import { PiapiUdioGenerator } from "./piapiUdioGenerator.js";
import { DiffRhythmGenerator } from "./diffRhythmGenerator.js";
import { AudioGenerator, GenerationMode } from "./audioGenerator.js";
import { audioPlayer } from "./playback.js";
import { buildPrompt, DEFAULT_DURATION, MAX_SNIPPET } from "./utils.js";

// Session state
export interface SessionState {
  isActive: boolean;
  currentTrackUrl: string | null;
  mode: GenerationMode;
  genre?: string;
  language?: string;
}

// Global session state
export const session: SessionState = {
  isActive: false,
  currentTrackUrl: null,
  mode: GenerationMode.Instrumental, // Default to instrumental
  genre: undefined,
  language: undefined, // Default language
};

const inputSchema = {
  type: "object",
  properties: {
    code: {
      type: "string",
      description: "The current coding context from the user's session",
      required: true,
    },
    language: {
      type: "string",
      description:
        "The programming language of the code (e.g., 'javascript', 'python', 'java')",
    },
    genre: {
      type: "string",
      description:
        'Music genre to generate (e.g., "lo-fi house", "synthwave", "ambient")',
    },
    mode: {
      type: "string",
      description:
        "The optional mode to generate music in (e.g., 'instrumental', 'lyrical') -- only if the user specifies",
    },
  },
};

// Determine the mode from command-line arguments
function determineMode(): GenerationMode {
  const args = process.argv.slice(2);
  if (args.includes("lyrical")) {
    return GenerationMode.Lyrical;
  }
  return GenerationMode.Instrumental; // Default to instrumental
}

// Check for API key availability
function checkApiKeys(): { hasStableKey: boolean; hasPiapiKey: boolean } {
  console.log("Checking API Keys...");
  console.log(
    "STABLE_AUDIO_KEY:",
    process.env.STABLE_AUDIO_KEY ? "exists" : "undefined"
  );
  console.log("PIAPI_KEY:", process.env.PIAPI_KEY ? "exists" : "undefined");

  const hasStableKey =
    !!process.env.STABLE_AUDIO_KEY &&
    process.env.STABLE_AUDIO_KEY !== "your_api_key_here";
  const hasPiapiKey =
    !!process.env.PIAPI_KEY && process.env.PIAPI_KEY !== "your_api_key_here";

  console.log("Keys found:", { hasStableKey, hasPiapiKey });
  return { hasStableKey, hasPiapiKey };
}

// Determine if DiffRhythm should be used
function shouldUseDiffRhythm(): boolean {
  const args = process.argv.slice(2);
  return args.includes("diffrhythm");
}

// Set the mode based on command-line arguments
session.mode = determineMode();

// Check API key availability
const { hasStableKey, hasPiapiKey } = checkApiKeys();

// Check if DiffRhythm should be used
const useDiffRhythm = shouldUseDiffRhythm();

// Function to get the appropriate audio generator based on mode and available keys
function getAudioGenerator(mode: GenerationMode): AudioGenerator {
  if (useDiffRhythm) {
    // If DiffRhythm is explicitly requested, use it
    if (hasPiapiKey) {
      console.log(`Using PiAPI DiffRhythm for ${mode} music generation`);
      return new DiffRhythmGenerator(mode);
    } else {
      console.error(
        "Error: PiAPI key required for DiffRhythm music generation"
      );
      process.exit(1);
    }
  } else if (mode === GenerationMode.Instrumental) {
    // For instrumental mode, prefer Stability AI if available
    if (hasStableKey) {
      console.log("Using Stability AI for instrumental music generation");
      return new StableAudioGenerator();
    } else if (hasPiapiKey) {
      console.log("Using PiAPI Udio for instrumental music generation");
      return new PiapiUdioGenerator(GenerationMode.Instrumental);
    } else {
      console.error("Error: No API keys available for music generation");
      process.exit(1);
    }
  } else {
    // For lyrical mode, use PiAPI Udio
    if (hasPiapiKey) {
      console.log("Using PiAPI Udio for lyrical music generation");
      return new PiapiUdioGenerator(GenerationMode.Lyrical);
    } else {
      console.error("Error: PiAPI key required for lyrical music generation");
      process.exit(1);
    }
  }
}

// Type definitions for function arguments
export interface SessionArgs {
  code: string;
  genre?: string;
  mode?: string;
  language?: string;
}

// Validate arguments for start_vibe_session
export const isValidSessionArgs = (args: any): args is SessionArgs => {
  return (
    typeof args === "object" &&
    args !== null &&
    args.code !== undefined &&
    typeof args.code === "string"
  );
};

/**
 * Common logic for generating music
 * @param args Arguments including optional genre
 * @returns Result object with prompt immediately, while audio generation continues in background
 */
async function generateMusicLogic(
  args: SessionArgs
): Promise<{ prompt: string }> {
  // Update genre if provided
  if (args.genre) {
    session.genre = args.genre;
  }

  // Update mode if provided in args, otherwise keep the current session mode
  if (args.mode) {
    session.mode = args.mode as GenerationMode;
  }

  // Update language if provided
  if (args.language) {
    session.language = args.language;
    console.log(`Language provided by client: ${args.language}`);
  } else {
    console.log(
      `No language provided by client, using default: ${session.language}`
    );
  }

  // Get the appropriate audio generator for the current mode
  const audioGenerator = getAudioGenerator(session.mode);

  // Generate a prompt based on the context
  const prompt = buildPrompt(args.code, session.genre, session.language);

  // Start audio generation and playback in the background
  // This runs asynchronously and doesn't block the response
  (async () => {
    try {
      // Generate music using the audio generator
      const audioUrl = await audioGenerator.generate(prompt, {
        genre: session.genre,
        mode: session.mode,
        code: args.code,
      });
      session.currentTrackUrl = audioUrl;

      // Play the audio
      try {
        await audioPlayer.play(audioUrl, true);
      } catch (error) {
        console.error("Error playing audio:", error);
        // Continue even if playback fails
      }
    } catch (error) {
      console.error("Error in background music generation:", error);
      // Since we're in a background task, we can only log errors
      session.isActive = false;
      session.currentTrackUrl = null;
    }
  })();

  // Return the prompt immediately without waiting for audio generation
  return {
    prompt,
  };
}

/**
 * Core logic for starting a vibe session
 * @param args Session arguments including optional genre
 * @returns Result object with audioUrl and genre
 */
export async function startSessionLogic(
  args: SessionArgs
): Promise<{ prompt: string; error?: string }> {
  try {
    // If session is already active, stop it first
    if (session.isActive) {
      // Stop the current session
      audioPlayer.stop();
      session.isActive = false;
      session.currentTrackUrl = null;
      console.log("Stopped active session to start a new one");
    }

    // Update session state
    session.isActive = true;

    // Generate music
    const result = await generateMusicLogic(args);

    return result;
  } catch (error) {
    // Reset session state on error
    session.isActive = false;
    session.currentTrackUrl = null;

    return {
      prompt: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Core logic for generating more music
 * @param args Arguments including optional genre
 * @returns Result object with audioUrl and genre
 */
export async function generateMoreLogic(
  args: SessionArgs
): Promise<{ prompt: string; error?: string }> {
  try {
    // If session is not active, return an error
    if (!session.isActive) {
      return {
        prompt: "",
        error: "No active vibe session",
      };
    }

    // Generate music
    const result = await generateMusicLogic(args);

    return result;
  } catch (error) {
    return {
      prompt: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Core logic for stopping a vibe session
 * @returns Result object indicating success or error
 */
export function stopSessionLogic(): { success: boolean; error?: string } {
  // If session is not active, return an error
  if (!session.isActive) {
    return {
      success: false,
      error: "No active vibe session to stop",
    };
  }

  // Reset session state
  session.isActive = false;
  session.currentTrackUrl = null;

  // Stop all audio playback
  audioPlayer.stop();

  return {
    success: true,
  };
}

class VibeSoundtrackServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "vibes",
        version: "0.1.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupToolHandlers();

    // Error handling
    this.server.onerror = (error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "start_vibe_session",
          description: `Starts a new music generation session based on the current code context. The user might say they want to vibe or to create a soundtrack.
            The user can also specify a programming language for the code but it is not required. Do not pass in a programming language or ask for one if the user does not specify one.
            The user can also specify a genre for the music but it is not required. Do not pass in a genre or ask for one if the user does not specify one.
            The user can also specify the mode for the music but it is not required. Do not pass in a mode or ask for one if the user does not specify one.
            Pass in any snippet or summary of code (max ${MAX_SNIPPET} characters) that you have in your context as a result of what you and the user have been working on together.
            Vibes can be started in plan mode as well as act mode.`,
          inputSchema: inputSchema,
        },
        {
          name: "generate_more_music",
          description: `Generates more music as the previous chunk is almost finished.
            This should be called as soon as there is more code to generate music for -- pass in any snipped or summary of code (max ${MAX_SNIPPET} characters).
            Each track plays for ${DEFAULT_DURATION} seconds so you MUST call this tool as soon as you have more code to work with.
            If the user specified a programming language when starting the session, pass it in again as an argument. If the user did not specify a programming language, do not ask or pass in a programming language as an argument.
            If the user specified a genre when starting the session, pass it in again as an argument. If the user did not specify a genre, do not ask or pass in a genre as an argument.
            If the user specified a mode when starting the session, pass it in again as an argument. If the user did not specify a mode, do not ask or pass in a mode as an argument.`,
          inputSchema: inputSchema,
        },
        {
          name: "stop_vibe_session",
          description: "Stops the music generation session",
          inputSchema: { type: "object" },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case "start_vibe_session":
          return this.handleStartSession(request.params.arguments);
        case "generate_more_music":
          return this.handleGenerateMore(request.params.arguments);
        case "stop_vibe_session":
          return this.handleStopSession();
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
  }

  private async handleStartSession(args: unknown) {
    if (!isValidSessionArgs(args)) {
      throw new McpError(ErrorCode.InvalidParams, "Invalid session arguments");
    }

    // Call the core logic function
    const result = await startSessionLogic(args);

    // If there's an error, return an error response
    if (result.error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to start vibe session: ${result.error}`,
          },
        ],
        isError: true,
      };
    }

    // Return a success response
    return {
      content: [
        {
          type: "text",
          text: `🎵 Vibe session started: ${result.prompt}`,
        },
      ],
    };
  }

  private async handleGenerateMore(args: unknown) {
    if (!isValidSessionArgs(args)) {
      throw new McpError(ErrorCode.InvalidParams, "Invalid session arguments");
    }

    // Call the core logic function
    const result = await generateMoreLogic(args);

    // If there's an error, return an error response
    if (result.error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to generate more music: ${result.error}`,
          },
        ],
        isError: true,
      };
    }

    // Return a success response
    return {
      content: [
        {
          type: "text",
          text: `🎵 Continuing to vibe: ${result.prompt}`,
        },
      ],
    };
  }

  private handleStopSession() {
    // Call the core logic function
    const result = stopSessionLogic();

    // If there's an error, return an error response
    if (result.error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to stop vibe session: ${result.error}`,
          },
        ],
        isError: true,
      };
    }

    // Return a success response
    return {
      content: [
        {
          type: "text",
          text: "🎵 Vibe session stopped.",
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Vibes MCP server running on stdio");
  }
}

// Test function to verify language parameter handling
async function testLanguageParameter() {
  console.log("=== Testing Language Parameter Handling ===");

  // Test with Rust language
  const testArgs: SessionArgs = {
    code: "extern crate piston_window;",
    language: "rust",
  };

  console.log("Testing with language: rust");
  const result = await generateMusicLogic(testArgs);
  console.log(
    "Test completed. Check logs above for language and genre selection."
  );

  return result;
}

// Run the test if the --test flag is provided
if (process.argv.includes("--test")) {
  testLanguageParameter()
    .then(() => {
      console.log("Test completed, exiting.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Test failed:", error);
      process.exit(1);
    });
} else {
  // Normal server startup
  const server = new VibeSoundtrackServer();
  server.run().catch(console.error);
}
