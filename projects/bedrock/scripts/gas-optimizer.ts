import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';
import chalk from 'chalk';

const execPromise = util.promisify(exec);

interface GasUsage {
  contractName: string;
  methodName: string;
  gasUsed: number;
  recommendations: string[];
}

/**
 * Gas Optimization Script
 * This script analyzes contract deployments and function gas usage,
 * and provides recommendations for gas optimization.
 */
async function analyzeGasUsage() {
  try {
    console.log(chalk.blue('Starting gas usage analysis...'));

    // Run tests with gas reporter enabled
    process.env.REPORT_GAS = 'true';
    console.log(chalk.yellow('Running tests with gas reporter...'));
    await execPromise('npx hardhat test');

    // Get all contract artifacts
    const artifactsDir = path.join(__dirname, '../artifacts/contracts');
    const contracts = findSolFiles(artifactsDir);

    // Analyze each contract
    const results: GasUsage[] = [];
    for (const contractFile of contracts) {
      try {
        const contractName = path.basename(contractFile, '.sol');
        console.log(chalk.green(`Analyzing ${contractName}...`));
        
        // Get contract bytecode size
        const bytecodeSize = await getContractBytecodeSize(contractName);
        if (bytecodeSize > 24576) {
          results.push({
            contractName,
            methodName: 'Contract Size',
            gasUsed: bytecodeSize,
            recommendations: [
              'Contract exceeds EIP-170 size limit of 24KB. Consider splitting it into multiple contracts.',
              'Use libraries to move reusable code.'
            ]
          });
        }
        
        // Analyze methods for high gas usage
        const methodGasUsage = await getMethodGasUsage(contractName);
        for (const [methodName, gasUsed] of Object.entries(methodGasUsage)) {
          const gasRecommendations = getGasRecommendations(gasUsed as number, methodName);
          if (gasRecommendations.length > 0) {
            results.push({
              contractName,
              methodName,
              gasUsed: gasUsed as number,
              recommendations: gasRecommendations
            });
          }
        }
      } catch (error) {
        console.error(chalk.red(`Error analyzing contract: ${error}`));
      }
    }

    // Generate report
    generateReport(results);

  } catch (error) {
    console.error(chalk.red(`Error in gas analysis: ${error}`));
    process.exit(1);
  }
}

/**
 * Recursively find all .sol files in the contracts directory
 */
function findSolFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results = results.concat(findSolFiles(filePath));
    } else if (path.extname(file) === '.sol') {
      results.push(filePath);
    }
  });
  
  return results;
}

/**
 * Get contract bytecode size
 */
async function getContractBytecodeSize(contractName: string): Promise<number> {
  try {
    const result = await execPromise(`npx hardhat run scripts/get-bytecode-size.ts --contract ${contractName}`);
    return parseInt(result.stdout.trim(), 10);
  } catch (error) {
    console.error(chalk.red(`Error getting bytecode size: ${error}`));
    return 0;
  }
}

/**
 * Get gas usage for each method in a contract
 */
async function getMethodGasUsage(contractName: string): Promise<Record<string, number>> {
  try {
    // This would use data from gas reporter or analyze test results
    // For now, we'll use a simplified approach to demonstrate the concept
    const testOutput = await execPromise(`npx hardhat test --grep ${contractName}`);
    
    // Parse test output for gas usage (this is a simplified implementation)
    // In a real implementation, you would parse the gas reporter output
    const gasPattern = /Method\s+(\w+).*?(\d+)\s+gas/g;
    let match;
    const gasUsage: Record<string, number> = {};
    
    while ((match = gasPattern.exec(testOutput.stdout)) !== null) {
      const methodName = match[1];
      const gas = parseInt(match[2], 10);
      gasUsage[methodName] = gas;
    }
    
    return gasUsage;
  } catch (error) {
    console.error(chalk.red(`Error getting method gas usage: ${error}`));
    return {};
  }
}

/**
 * Get gas optimization recommendations based on gas usage
 */
function getGasRecommendations(gasUsed: number, methodName: string): string[] {
  const recommendations: string[] = [];
  
  if (gasUsed > 200000) {
    recommendations.push('High gas usage. Consider breaking down the function into smaller functions.');
  }
  
  if (methodName.toLowerCase().includes('loop') && gasUsed > 100000) {
    recommendations.push('Loop operations are expensive. Consider using mappings for lookups instead of arrays.');
  }
  
  if (gasUsed > 50000) {
    recommendations.push('Consider using gas-efficient alternatives for storage operations.');
    recommendations.push('Use uint256 instead of smaller integers unless packaging multiple values into a single slot.');
  }
  
  return recommendations;
}

/**
 * Generate a gas optimization report
 */
function generateReport(results: GasUsage[]): void {
  console.log('\n' + chalk.blue.bold('GAS OPTIMIZATION REPORT'));
  console.log(chalk.blue('======================\n'));
  
  if (results.length === 0) {
    console.log(chalk.green('✓ No gas optimization issues found.'));
    return;
  }
  
  // Group by contract
  const contractGroups: Record<string, GasUsage[]> = {};
  results.forEach(result => {
    if (!contractGroups[result.contractName]) {
      contractGroups[result.contractName] = [];
    }
    contractGroups[result.contractName].push(result);
  });
  
  // Print results by contract
  Object.entries(contractGroups).forEach(([contractName, usages]) => {
    console.log(chalk.yellow.bold(`\nContract: ${contractName}`));
    console.log(chalk.yellow('-'.repeat(contractName.length + 10)));
    
    usages.forEach(usage => {
      console.log(chalk.cyan(`\n  Method: ${usage.methodName}`));
      console.log(chalk.red(`  Gas Used: ${usage.gasUsed.toLocaleString()} gas`));
      console.log('  Recommendations:');
      usage.recommendations.forEach(rec => {
        console.log(chalk.green(`    • ${rec}`));
      });
    });
  });
  
  // Save report to file
  const reportPath = path.join(__dirname, '../gas-report.md');
  let reportContent = '# Gas Optimization Report\n\n';
  
  Object.entries(contractGroups).forEach(([contractName, usages]) => {
    reportContent += `## Contract: ${contractName}\n\n`;
    
    usages.forEach(usage => {
      reportContent += `### Method: ${usage.methodName}\n`;
      reportContent += `**Gas Used:** ${usage.gasUsed.toLocaleString()} gas\n\n`;
      reportContent += '**Recommendations:**\n';
      usage.recommendations.forEach(rec => {
        reportContent += `- ${rec}\n`;
      });
      reportContent += '\n';
    });
  });
  
  fs.writeFileSync(reportPath, reportContent);
  console.log(chalk.blue(`\nReport saved to ${reportPath}`));
}

// Run the script
analyzeGasUsage().catch(error => {
  console.error(chalk.red(`Fatal error: ${error}`));
  process.exit(1);
});