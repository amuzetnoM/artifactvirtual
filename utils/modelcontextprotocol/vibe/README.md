# Vibe MCp

The ultimate vibe coding tool

An MCP server that generates music based on your coding context. It supports multiple audio generation backends including Stable Audio API and Udio to create short music clips that match what you're working on, with built-in playback and crossfading between tracks.

## Features

- **Start a vibe session**: Begin generating music based on your current coding context
- **Generate more music**: Request additional music as the previous chunk is almost finished, with smooth crossfading
- **Stop a vibe session**: End the music generation session
- **Server-side playback**: Audio is played directly by the MCP server with automatic crossfading between tracks
- **Multiple audio generators**: Support for Stable Audio API, Udio, and DiffRhythm
- **Instrumental and lyrical modes**: Generate either instrumental tracks or music with AI-generated lyrics

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install FFmpeg (required for audio playback):

   ```bash
   # macOS
   brew install ffmpeg

   # Ubuntu/Debian
   sudo apt-get install ffmpeg

   # Windows (using Chocolatey)
   choco install ffmpeg
   ```

4. Build the project:
   ```bash
   npm run build
   ```
5. Set up your API keys in the `.env` file:

   ```
   STABLE_AUDIO_KEY=your_stable_audio_key_here
   PIAPI_KEY=your_piapi_key_here
   ```

   - Get your Stable Audio API key from [Stability AI](https://platform.stability.ai/)
   - Get your PiAPI key from [PiAPI](https://piapi.io/)

   Note: You need at least one of these keys to use the MCP server. If you have both, the server will choose the appropriate one based on the generation mode.

## Usage

### As an MCP Server

To use this as an MCP server with Cline, you need to add it to your MCP settings file:

1. Edit your MCP settings file:

   ```bash
   # For VSCode
   vim ~/Library/Application\ Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
   # For Cursor
   vim ~/Library/Application\ Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
   # For Claude Desktop
   vim ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. Add the following configuration:

   ```json
   {
     "mcpServers": {
       "vibe-mcp": {
         "autoApprove": [
           "start_vibe_session",
           "generate_more_music",
           "stop_vibe_session"
         ],
         "command": "node",
         "args": ["/path/to/vibe-mcp/build/index.js"],
         "env": {
           "STABLE_AUDIO_KEY": "your_stable_audio_key_here",
           "PIAPI_KEY": "your_piapi_key_here"
         }
       }
     }
   }
   ```

3. Optional command-line arguments:

   - Add `lyrical` to enable lyrical mode by default: `["/path/to/vibe-mcp/build/index.js", "lyrical"]`
   - Add `diffrhythm` to use the DiffRhythm generator: `["/path/to/vibe-mcp/build/index.js", "lyrical diffrhythm"]`

4. Restart Cline or Claude Desktop

## Tools

The MCP server provides three tools:

### start_vibe_session

Starts a new music generation session based on the current coding context.

**Parameters:**

- `code` (required): The current coding context from the user's session
- `genre` (optional): Music genre to generate (e.g., "lo-fi house", "synthwave", "ambient")
- `mode` (optional): The mode to generate music in (e.g., 'instrumental', 'lyrical')
- `language` (optional): The programming language of the code (e.g., 'javascript', 'python', 'rust')

**Returns:**

- Prompt information and starts playing music in the background

### generate_more_music

Generates more music as the previous chunk is almost finished.

**Parameters:**

- `code` (required): The current coding context from the user's session
- `genre` (optional): Music genre to generate (defaults to the genre used in the session)
- `mode` (optional): The mode to generate music in (defaults to the mode used in the session)
- `language` (optional): The programming language of the code (defaults to the language used in the session)

**Returns:**

- Prompt information and continues playing music in the background

### stop_vibe_session

Stops the music generation session.

**Parameters:**

- None

**Returns:**

- Success message

## Audio Generators

The MCP server supports multiple audio generators:

### StableAudioGenerator

Uses the Stability AI API to generate instrumental music. Requires a `STABLE_AUDIO_KEY`.

### PiapiUdioGenerator

Uses the PiAPI Udio service to generate both instrumental and lyrical music. Requires a `PIAPI_KEY`.

### DiffRhythmGenerator

Uses the PiAPI DiffRhythm service for specialized music generation. Requires a `PIAPI_KEY` and the `diffrhythm` command-line argument.

## Generation Modes

The MCP server supports two generation modes:

### Instrumental Mode

Generates music without lyrics. This is the default mode and can use either the Stability AI API or PiAPI service.

### Lyrical Mode

Generates music with AI-generated lyrics based on your code context. This mode requires the PiAPI Udio service and can be enabled by:

- Passing `mode: "lyrical"` in the tool parameters
- Adding the `lyrical` command-line argument when starting the server
- Adding `lyrical diffrhythm` to the command-line arguments

## License

MIT
