#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Direct MCP Tool Invocation");
console.log("=========================");

// Path to the MCP server
const mcpServerPath = path.join(__dirname, 'build', 'index.js');

// Simple test code
const testCode = `
function helloWorld() {
  console.log("Hello, Vibe!");
  return "Playing some awesome tunes";
}
`;

// Try just a basic JSON-RPC request without any MCP-specific structure
// This is the most basic format to see if the server responds at all
const simpleRequest = {
  jsonrpc: "2.0",
  method: "listTools",  // Just try the most basic method name
  params: {},
  id: 1
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

// Handle stdout data
mcpProcess.stdout.on('data', (data) => {
  const text = data.toString();
  console.log(`[SERVER OUTPUT]: ${text.trim()}`);
});

// Handle stderr data
mcpProcess.stderr.on('data', (data) => {
  console.error(`[SERVER ERROR]: ${data.toString().trim()}`);
});

// Handle process exit
mcpProcess.on('exit', (code) => {
  console.log(`MCP server exited with code ${code}`);
});

// Send the simple request
setTimeout(() => {
  console.log("[SENDING SIMPLE REQUEST]", JSON.stringify(simpleRequest));
  mcpProcess.stdin.write(JSON.stringify(simpleRequest) + '\n');
}, 1000);

// Handle cleanup
process.on('SIGINT', () => {
  console.log("Terminating MCP server...");
  mcpProcess.kill();
  process.exit();
});