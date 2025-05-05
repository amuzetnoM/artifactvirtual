import { HardhatRuntimeEnvironment } from 'hardhat/types';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';

const hre = require('hardhat') as HardhatRuntimeEnvironment;

interface GasUsageData {
  functionName: string;
  gasUsed: number;
  method: string;
  contractName: string;
  contractAddress?: string;
}

/**
 * Gas Optimization Script
 * This script analyzes smart contracts for gas usage and suggests optimizations
 * Usage: npx hardhat run scripts/gas-optimizer.ts --contract ContractName
 */
async function optimizeGasUsage() {
  try {
    console.log(chalk.blue('Starting gas optimization analysis...'));
    
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
      console.error(chalk.red('Error: Contract name not provided. Use --contract ContractName'));
      process.exit(1);
    }
    
    // Step 1: Compile the contract
    console.log(chalk.yellow('Compiling contract...'));
    await hre.run('compile');
    
    // Step 2: Run test to collect gas usage data
    console.log(chalk.yellow('Running gas reporter tests...'));
    try {
      // Set environment variable to enable gas reporter
      process.env.REPORT_GAS = 'true';
      // Run tests that involve the specified contract
      await hre.run('test');
    } catch (error) {
      console.log(chalk.yellow('Tests completed with some failures. Continuing with optimization analysis...'));
    }
    
    // Step 3: Get contract bytecode size
    console.log(chalk.yellow('Analyzing contract bytecode size...'));
    let bytecodeSize;
    
    try {
      const result = execSync(`npx hardhat run scripts/get-bytecode-size.ts --contract ${contractName}`);
      bytecodeSize = parseInt(result.toString().trim());
    } catch (error) {
      console.log(chalk.red(`Failed to get bytecode size: ${error}`));
      bytecodeSize = 'Unknown';
    }
    
    // Step 4: Read the contract source code for analysis
    const contractsDir = path.join(__dirname, '../contracts');
    const contractFiles = findContractFiles(contractsDir, contractName);
    
    if (contractFiles.length === 0) {
      console.error(chalk.red(`Error: No source file found for contract ${contractName}`));
      process.exit(1);
    }
    
    const contractFilePath = contractFiles[0];
    const sourceCode = fs.readFileSync(contractFilePath, 'utf8');
    
    // Step 5: Analyze source code for potential optimizations
    const optimizationSuggestions = analyzeSourceCode(sourceCode, contractName);
    
    // Step 6: Collect gas profiling data from gasReporter output (if available)
    const gasProfiling = collectGasProfiling(contractName);
    
    // Step 7: Generate and display the report
    generateReport(contractName, bytecodeSize, optimizationSuggestions, gasProfiling);
    
  } catch (error) {
    console.error(chalk.red(`Error optimizing gas usage: ${error}`));
    process.exit(1);
  }
}

/**
 * Find contract source files by contract name
 */
function findContractFiles(dir: string, contractName: string): string[] {
  const results: string[] = [];
  
  function searchDir(currentDir: string) {
    const files = fs.readdirSync(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        searchDir(filePath);
      } else if (file.endsWith('.sol')) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes(`contract ${contractName}`) || content.includes(`library ${contractName}`)) {
          results.push(filePath);
        }
      }
    }
  }
  
  searchDir(dir);
  return results;
}

/**
 * Analyze source code for potential gas optimizations
 */
function analyzeSourceCode(sourceCode: string, contractName: string): string[] {
  const suggestions: string[] = [];
  
  // Check for storage packing opportunities
  if (/uint8|uint16|uint32|uint64|uint128/.test(sourceCode)) {
    suggestions.push('Consider packing storage variables to save gas');
  }
  
  // Check for using immutable variables
  if (/\bconstant\b/.test(sourceCode) && !/\bimmutable\b/.test(sourceCode)) {
    suggestions.push('Consider using "immutable" for variables that are set in the constructor');
  }
  
  // Check for unchecked blocks with arithmetic
  if (/[\+\-\*\/]\=?/.test(sourceCode) && !/unchecked/.test(sourceCode)) {
    suggestions.push('Consider using "unchecked" blocks for arithmetic operations that cannot overflow');
  }
  
  // Check for external vs public functions
  const publicFunctions = (sourceCode.match(/function\s+\w+\s*\([^)]*\)\s+public/g) || []).length;
  if (publicFunctions > 0) {
    suggestions.push('Consider changing "public" functions to "external" if they are only called externally');
  }
  
  // Check for memory vs calldata
  if (/function\s+\w+\s*\([^)]*memory\s+\w+\[?\]?[^)]*\)\s+external/.test(sourceCode)) {
    suggestions.push('Consider using "calldata" instead of "memory" for external function parameters');
  }
  
  // Check for require statements with string messages
  if (/require\([^)]+,\s*["']/.test(sourceCode)) {
    suggestions.push('Consider using custom errors instead of require with string messages');
  }
  
  // Check for uint256 explicit declaration
  if (/uint256/.test(sourceCode)) {
    suggestions.push('Consider using "uint" instead of "uint256" to save gas on bytecode size');
  }
  
  // Check for structs
  if (/struct\s+\w+\s*{[^}]+}/.test(sourceCode)) {
    suggestions.push('Ensure struct fields are ordered from smallest to largest size');
  }
  
  // Check for mappings in loops
  if (/for\s*\([^)]+\)\s*{[^}]*mapping/.test(sourceCode)) {
    suggestions.push('Avoid accessing mappings in loops - consider caching values');
  }
  
  return suggestions;
}

/**
 * Collect gas profiling data from hardhat-gas-reporter output
 */
function collectGasProfiling(contractName: string): GasUsageData[] {
  try {
    // Attempt to read the gas reporter output (assuming it's written to a file)
    const gasReportPath = path.join(__dirname, '../gas-report.json');
    if (fs.existsSync(gasReportPath)) {
      const gasReportData = JSON.parse(fs.readFileSync(gasReportPath, 'utf8'));
      
      // Filter and transform the data as needed
      return gasReportData
        .filter((item: any) => item.contractName === contractName)
        .map((item: any) => ({
          functionName: item.functionName || 'unknown',
          gasUsed: item.gasUsed || 0,
          method: item.method || 'unknown',
          contractName: item.contractName
        }));
    }
    
    // If no gas report file exists, return empty array
    return [];
  } catch (error) {
    console.log(chalk.yellow('Gas profiling data not available'));
    return [];
  }
}

/**
 * Generate and display the optimization report
 */
function generateReport(
  contractName: string,
  bytecodeSize: number | string,
  optimizationSuggestions: string[],
  gasProfiling: GasUsageData[]
): void {
  console.log('\n' + chalk.blue.bold('GAS OPTIMIZATION REPORT'));
  console.log(chalk.blue('=======================\n'));
  
  console.log(chalk.white.bold(`Contract: ${contractName}`));
  console.log(chalk.white(`Bytecode Size: ${bytecodeSize} bytes`));
  
  if (typeof bytecodeSize === 'number') {
    // Add warning if close to the contract size limit
    if (bytecodeSize > 20000) {
      const percentOfLimit = ((bytecodeSize / 24576) * 100).toFixed(1);
      console.log(chalk.yellow(`⚠️ Contract is at ${percentOfLimit}% of the 24KB size limit`));
    }
  }
  
  console.log('\n' + chalk.green.bold('OPTIMIZATION SUGGESTIONS:'));
  if (optimizationSuggestions.length > 0) {
    optimizationSuggestions.forEach((suggestion, i) => {
      console.log(chalk.green(`${i+1}. ${suggestion}`));
    });
  } else {
    console.log(chalk.green('No obvious optimization suggestions found.'));
  }
  
  if (gasProfiling.length > 0) {
    console.log('\n' + chalk.yellow.bold('GAS USAGE PROFILE:'));
    console.log(chalk.yellow('Function                         | Gas Used'));
    console.log(chalk.yellow('---------------------------------|----------'));
    
    // Sort functions by gas usage, highest first
    gasProfiling
      .sort((a, b) => b.gasUsed - a.gasUsed)
      .forEach(profile => {
        const functionName = profile.functionName.padEnd(30);
        console.log(`${functionName} | ${profile.gasUsed}`);
      });
  }
  
  console.log('\n' + chalk.blue.bold('GENERAL OPTIMIZATION TIPS:'));
  console.log(chalk.blue('1. Use events to store data that doesn\'t need on-chain access'));
  console.log(chalk.blue('2. Batch operations instead of individual operations'));
  console.log(chalk.blue('3. Use ERC1167 proxy pattern for deploying many instances of the same contract'));
  console.log(chalk.blue('4. Consider using assembly for complex operations'));
  console.log(chalk.blue('5. Store small values together in a single storage slot'));
}

// Run the script
optimizeGasUsage().catch(error => {
  console.error(chalk.red(`Fatal error: ${error}`));
  process.exit(1);
});