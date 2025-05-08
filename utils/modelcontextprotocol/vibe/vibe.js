#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command-line arguments
const args = process.argv.slice(2);
const command = args[0] || 'start';
let codeFile, genre, mode, language;

// Create a temporary code file if none is provided
const tempCodeFile = path.join(__dirname, 'temp_code.txt');

// Function to create or use a code file
function getCodeFile() {
  if (!codeFile) {
    // If no code file is provided, create a temporary one with sample code
    const sampleCode = `
// Artifact Virtual RAG System
// This is a workspace for a Retrieval Augmented Generation system
// that combines multiple components for AI-powered knowledge retrieval

function processDocuments(documents) {
  // Extract relevant information from documents
  const extractedInfo = documents.map(doc => {
    return {
      content: doc.content,
      metadata: doc.metadata,
      embedding: generateEmbedding(doc.content)
    };
  });
  
  return extractedInfo;
}

function generateEmbedding(text) {
  // Simulate embedding generation
  return "vector representation of text...";
}

// Main RAG pipeline
function ragPipeline(query) {
  const relevantDocs = retrieveDocuments(query);
  const enrichedPrompt = augmentPrompt(query, relevantDocs);
  return generateResponse(enrichedPrompt);
}

console.log("RAG system initialized successfully");
`;
    
    fs.writeFileSync(tempCodeFile, sampleCode, 'utf8');
    return tempCodeFile;
  }
  return codeFile;
}

// Handle different commands
if (command === 'start') {
  codeFile = args[1];
  genre = args[2] || 'lo-fi';
  mode = args[3] || 'instrumental';
  language = args[4] || 'javascript';
  
  console.log(`Starting vibe session with:
  - Genre: ${genre}
  - Mode: ${mode}
  - Language: ${language}
  `);
  
  try {
    execSync(`node "${path.join(__dirname, 'start_vibe.js')}" "${getCodeFile()}" "${genre}" "${mode}" "${language}"`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Error starting vibe session:', error.message);
  }
} else if (command === 'more') {
  codeFile = args[1];
  genre = args[2] || 'lo-fi';
  mode = args[3] || 'instrumental';
  language = args[4] || 'javascript';
  
  console.log(`Generating more music with:
  - Genre: ${genre}
  - Mode: ${mode}
  - Language: ${language}
  `);
  
  try {
    execSync(`node "${path.join(__dirname, 'generate_more.js')}" "${getCodeFile()}" "${genre}" "${mode}" "${language}"`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Error generating more music:', error.message);
  }
} else if (command === 'stop') {
  console.log('Stopping vibe session...');
  
  // Create a simple stop script if it doesn't exist
  const stopScriptPath = path.join(__dirname, 'stop_vibe.js');
  if (!fs.existsSync(stopScriptPath)) {
    const stopScriptContent = `#!/usr/bin/env node
import { audioPlayer } from "./build/playback.js";
console.log("Stopping all audio playback...");
audioPlayer.stop();
console.log("Vibe session stopped.");
`;
    fs.writeFileSync(stopScriptPath, stopScriptContent, 'utf8');
  }
  
  try {
    execSync(`node "${stopScriptPath}"`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Error stopping vibe session:', error.message);
  }
} else {
  console.log(`
Vibe MCP - Music Generation Tool

Usage:
  node vibe.js [command] [code_file] [genre] [mode] [language]

Commands:
  start    Start a new vibe session (default)
  more     Generate more music
  stop     Stop the current vibe session

Options:
  code_file  Path to a code file to use for generating the music
             (If not provided, a sample code file will be used)
  genre      Music genre to generate (default: "lo-fi")
  mode       Generation mode: "instrumental" or "lyrical" (default: "instrumental")
  language   Programming language of the code (default: "javascript")

Examples:
  node vibe.js start path/to/your/file.js "synthwave" "instrumental" "javascript"
  node vibe.js more path/to/your/file.py "ambient" "instrumental" "python"
  node vibe.js stop
`);
}

// Clean up temp file if it was created
if (fs.existsSync(tempCodeFile) && !args[1]) {
  try {
    fs.unlinkSync(tempCodeFile);
  } catch (e) {
    // Ignore errors when cleaning up
  }
}