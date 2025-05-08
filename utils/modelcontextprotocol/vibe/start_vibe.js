#!/usr/bin/env node

// A simple script to start a vibe session
import fs from 'fs';
import { exec, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get arguments
const args = process.argv.slice(2);
const codeFile = args[0] || null;
const genre = args[1] || null;
const mode = args[2] || null;
const language = args[3] || null;

// Check if code file is provided
if (!codeFile) {
  console.error('Please provide a code file path as the first argument');
  process.exit(1);
}

// Read the code file
try {
  const code = fs.readFileSync(codeFile, 'utf8');
  
  // Create a payload for the MCP server
  const payload = {
    code,
  };
  
  // Add optional parameters if provided
  if (genre) payload.genre = genre;
  if (mode) payload.mode = mode;
  if (language) payload.language = language;
  
  // Call the MCP server directly using the build/index.js script
  const mcpServerPath = path.join(__dirname, 'build', 'index.js');
  
  // Create a temporary input file with the payload
  const tempInputPath = path.join(__dirname, 'temp_input.json');
  const tempOutputPath = path.join(__dirname, 'temp_output.json');
  
  fs.writeFileSync(tempInputPath, JSON.stringify({
    jsonrpc: "2.0",
    method: "callTool",
    params: {
      name: "start_vibe_session",
      arguments: payload
    },
    id: 1
  }));

  // Define environment variables with API keys
  const envVars = {
    STABLE_AUDIO_KEY: "sk-gxYxuwTk5FqyBopttOKxOV21J9OTW2ERt8fUYFjmGSESbL7u",
    PIAPI_KEY: "d8064ae83eacf5036e620a00c72bb452fcbbf781092ff91d126f34c83fc018a2"
  };

  // Use a different approach - pipe the output to a separate file for cleaner handling
  console.log("Starting vibe session...");
  
  try {
    // Execute command and redirect all output to temporary files
    const command = `node "${mcpServerPath}" < "${tempInputPath}" > "${tempOutputPath}" 2>stderr_log.txt`;
    execSync(command, { env: { ...process.env, ...envVars } });
    
    // Read the output file which should contain only the JSON response
    const output = fs.readFileSync(tempOutputPath, 'utf8');
    
    // Try to find valid JSON in the output
    let jsonStartIndex = output.indexOf('{');
    let jsonEndIndex = output.lastIndexOf('}');
    
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      const jsonString = output.substring(jsonStartIndex, jsonEndIndex + 1);
      const result = JSON.parse(jsonString);
      
      if (result.result && result.result.content) {
        result.result.content.forEach(item => {
          console.log(item.text);
        });
      } else if (result.error) {
        console.error(`Error from MCP server: ${JSON.stringify(result.error)}`);
      }
    } else {
      console.error("No valid JSON response found in output");
      console.error("Raw output:", output);
    }
  } catch (execError) {
    console.error(`Error executing MCP server:`, execError.message);
    // If there was an error, try to read stderr for more info
    try {
      const stderrContent = fs.readFileSync('stderr_log.txt', 'utf8');
      console.error("Error details:", stderrContent);
    } catch(e) {
      // Ignore if stderr log can't be read
    }
  } finally {
    // Clean up temporary files
    try { fs.unlinkSync(tempInputPath); } catch (e) {}
    try { fs.unlinkSync(tempOutputPath); } catch (e) {}
  }
  
} catch (error) {
  console.error(`Error reading code file: ${error.message}`);
  process.exit(1);
}