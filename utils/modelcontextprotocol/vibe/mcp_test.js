#!/usr/bin/env node

import fs from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Model Context Protocol Test");
console.log("==========================");

// Path to the MCP server
const mcpServerPath = path.join(__dirname, 'build', 'index.js');

// Simple test code
const testCode = `
function helloWorld() {
  console.log("Hello, Vibe!");
  return "Playing some awesome tunes";
}
`;

// Create a JSON-RPC request to list available tools
const listToolsRequest = {
  jsonrpc: "2.0",
  method: "mcp.listTools",  // Try with mcp. prefix
  id: 1
};

// Create a JSON-RPC request to call the start_vibe_session tool
const startVibeRequest = {
  jsonrpc: "2.0",
  method: "mcp.callTool",  // Try with mcp. prefix
  params: {
    name: "start_vibe_session",
    arguments: {
      code: testCode,
      genre: "lo-fi",
      mode: "instrumental",
      language: "javascript"
    }
  },
  id: 2
};

// Environment with API keys
const env = {
  ...process.env,
  STABLE_AUDIO_KEY: "sk-gxYxuwTk5FqyBopttOKxOV21J9OTW2ERt8fUYFjmGSESbL7u",
  PIAPI_KEY: "d8064ae83eacf5036e620a00c72bb452fcbbf781092ff91d126f34c83fc018a2"
};

// Spawn the MCP server process
console.log(`Starting MCP server: ${mcpServerPath}`);
const mcpProcess = spawn('node', [mcpServerPath], {
  env,
  stdio: ['pipe', 'pipe', 'pipe']
});

let buffer = '';
let receivedResponse = false;

// Handle stdout data
mcpProcess.stdout.on('data', (data) => {
  const text = data.toString();
  buffer += text;
  
  console.log(`[SERVER OUTPUT]: ${text.trim()}`);
  
  // Try to find JSON responses in the output
  try {
    if (text.includes('{') && text.includes('}')) {
      const jsonStart = buffer.indexOf('{');
      const jsonEnd = buffer.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = buffer.substring(jsonStart, jsonEnd);
        try {
          const jsonResponse = JSON.parse(jsonStr);
          console.log("\n[PARSED JSON RESPONSE]:", JSON.stringify(jsonResponse, null, 2));
          
          // If this was a response to listTools, send the startVibe request
          if (jsonResponse.id === 1 && !receivedResponse) {
            console.log("\n[SENDING START_VIBE_SESSION REQUEST]");
            mcpProcess.stdin.write(JSON.stringify(startVibeRequest) + '\n');
            receivedResponse = true;
          }
        } catch (e) {
          // Incomplete JSON, wait for more data
        }
      }
    }
  } catch (err) {
    console.error("Error parsing JSON:", err);
  }
});

// Handle stderr data
mcpProcess.stderr.on('data', (data) => {
  console.error(`[SERVER ERROR]: ${data.toString().trim()}`);
});

// Handle process exit
mcpProcess.on('exit', (code) => {
  console.log(`MCP server exited with code ${code}`);
});

// Send initial listTools request
console.log("[SENDING LIST_TOOLS REQUEST]");
mcpProcess.stdin.write(JSON.stringify(listToolsRequest) + '\n');

// Handle cleanup
process.on('SIGINT', () => {
  console.log("Terminating MCP server...");
  mcpProcess.kill();
  process.exit();
});