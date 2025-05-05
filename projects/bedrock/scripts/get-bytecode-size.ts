import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

const hre = require('hardhat') as HardhatRuntimeEnvironment;

/**
 * Script to get the bytecode size of a contract
 * Usage: npx hardhat run scripts/get-bytecode-size.ts --contract ContractName
 */
async function getBytecodeSize() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    let contractName = '';
    
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--contract' && i + 1 < args.length) {
        contractName = args[i + 1];
        break;
      }
    }
    
    if (!contractName) {
      console.error('Error: Contract name not provided. Use --contract ContractName');
      process.exit(1);
    }
    
    // Attempt to compile the contract
    await hre.run('compile');
    
    // Look for the contract artifact
    const artifactsDir = path.join(__dirname, '../artifacts/contracts');
    const artifactPaths = findContractArtifact(artifactsDir, contractName);
    
    if (artifactPaths.length === 0) {
      console.error(`Error: No artifact found for contract ${contractName}`);
      process.exit(1);
    }
    
    // Read the contract artifact and get bytecode
    const artifactPath = artifactPaths[0]; // Use the first match if multiple
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    if (!artifact.bytecode) {
      console.error(`Error: No bytecode found in artifact for contract ${contractName}`);
      process.exit(1);
    }
    
    // Calculate bytecode size in bytes (removing '0x' prefix and dividing by 2 since each byte is 2 hex characters)
    const bytecodeSize = (artifact.bytecode.length - 2) / 2;
    console.log(bytecodeSize);
    return bytecodeSize;
    
  } catch (error) {
    console.error(`Error getting bytecode size: ${error}`);
    process.exit(1);
  }
}

/**
 * Find contract artifact file(s) by contract name
 */
function findContractArtifact(dir: string, contractName: string): string[] {
  const results: string[] = [];
  
  // Recursively search for files
  function searchDir(currentDir: string) {
    const files = fs.readdirSync(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        searchDir(filePath);
      } else if (file === `${contractName}.json` || file.startsWith(`${contractName}.`)) {
        results.push(filePath);
      }
    }
  }
  
  searchDir(dir);
  return results;
}

// Run the script
getBytecodeSize().catch(error => {
  console.error(`Fatal error: ${error}`);
  process.exit(1);
});