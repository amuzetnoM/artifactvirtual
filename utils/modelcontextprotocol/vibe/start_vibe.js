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
  const tempDebugPath = path.join(__dirname, 'temp_debug.log');
  
  // Create an MCP-compliant request
  const mcpRequest = {
    jsonrpc: "2.0",
    method: "callTool",  // The standard method name for callTool in MCP
    params: {
      name: "start_vibe_session",  // The specific tool name
      arguments: payload           // The arguments to the tool
    },
    id: 1
  };
  
  // Write the request to the debug log
  fs.writeFileSync(tempDebugPath, `MCP REQUEST:\n${JSON.stringify(mcpRequest, null, 2)}\n\n`, 'utf8');
  
  // Write the request to the input file
  fs.writeFileSync(tempInputPath, JSON.stringify(mcpRequest), 'utf8');

  // Define environment variables with API keys
  const envVars = {
    STABLE_AUDIO_KEY: "sk-gxYxuwTk5FqyBopttOKxOV21J9OTW2ERt8fUYFjmGSESbL7u",
    PIAPI_KEY: "d8064ae83eacf5036e620a00c72bb452fcbbf781092ff91d126f34c83fc018a2"
  };

  // Use a different approach - pipe the output directly
  console.log("Starting vibe session...");
  
  try {
    // Run the MCP server and capture its output directly
    const command = `node "${mcpServerPath}"`;
    const childProcess = exec(command, { 
      env: { ...process.env, ...envVars } 
    });
    
    // Send input to the child process
    childProcess.stdin.write(JSON.stringify(mcpRequest) + '\n');
    childProcess.stdin.end();
    
    // Collect output
    let stdout = '';
    let stderr = '';
    
    childProcess.stdout.on('data', (data) => {
      stdout += data;
      // Append to debug log
      fs.appendFileSync(tempDebugPath, `STDOUT DATA: ${data}\n`, 'utf8');
      
      // Try to parse JSON as it comes
      const jsonMatch = data.match(/{.*}/s);
      if (jsonMatch) {
        try {
          const jsonData = JSON.parse(jsonMatch[0]);
          if (jsonData.result && jsonData.result.content) {
            jsonData.result.content.forEach(item => {
              if (item.text) {
                console.log(item.text);
              }
            });
          }
        } catch (e) {
          // Wait for more data, incomplete JSON
        }
      }
    });
    
    childProcess.stderr.on('data', (data) => {
      stderr += data;
      fs.appendFileSync(tempDebugPath, `STDERR DATA: ${data}\n`, 'utf8');
    });
    
    childProcess.on('close', (code) => {
      console.log(`MCP server exited with code ${code}`);
      
      if (code !== 0) {
        console.error('MCP server exited with an error');
        console.error('Check temp_debug.log for details');
      } else {
        // Try to parse the complete output
        try {
          const jsonMatch = stdout.match(/{.*}/s);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            if (result.result && result.result.content) {
              console.log('Vibe session response:');
              result.result.content.forEach(item => {
                console.log(item.text);
              });
            } else if (result.error) {
              console.error(`Error from MCP server: ${JSON.stringify(result.error)}`);
            }
          } else {
            console.error("No valid JSON found in output");
          }
        } catch (parseError) {
          console.error(`Error parsing MCP server output: ${parseError.message}`);
          console.error('Check temp_debug.log for the complete output');
        }
      }
      
      // Write final output to debug log
      fs.appendFileSync(tempDebugPath, `\nFINAL STDOUT:\n${stdout}\n\nFINAL STDERR:\n${stderr}`, 'utf8');
    });
  } catch (execError) {
    console.error(`Error executing MCP server:`, execError.message);
    // Write error to debug log
    fs.appendFileSync(tempDebugPath, `EXEC ERROR: ${execError.stack || execError.message}\n`, 'utf8');
  }
  
} catch (error) {
  console.error(`Error reading code file: ${error.message}`);
  process.exit(1);
}