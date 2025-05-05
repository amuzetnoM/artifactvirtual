import fs from 'fs';
import path from 'path';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import chalk from 'chalk';

const hre = require('hardhat') as HardhatRuntimeEnvironment;

interface DeploymentInfo {
  chainId: number;
  contractName: string;
  address: string;
  constructorArguments: any[];
  deploymentTime: string;
  deploymentTx: string;
}

/**
 * Contract Verification Script
 * This script automatically verifies deployed contracts on block explorers
 * Usage: npx hardhat run scripts/verify-contracts.ts --network <network-name>
 */
async function verifyContracts() {
  try {
    console.log(chalk.blue('Starting contract verification process...'));
    
    // Get current network
    const network = hre.network.name;
    const chainId = await hre.getChainId();
    console.log(chalk.yellow(`Network: ${network} (Chain ID: ${chainId})`));
    
    // Check if verification is enabled
    if (process.env.CONTRACT_VERIFICATION_ENABLED !== 'true') {
      console.log(chalk.red('Contract verification is disabled. Set CONTRACT_VERIFICATION_ENABLED=true in your .env file to enable.'));
      return;
    }
    
    // Check if API key is available for the current network
    const apiKeyName = getApiKeyNameForNetwork(network);
    if (!apiKeyName) {
      console.log(chalk.red(`No API key specified for network ${network}. Please check your .env file.`));
      return;
    }
    
    // Get deployment info from the local deployment file
    const deploymentsDir = path.join(__dirname, '../deployments');
    const deploymentFile = path.join(deploymentsDir, `${network}.json`);
    
    if (!fs.existsSync(deploymentFile)) {
      console.log(chalk.red(`No deployment file found for network ${network}.`));
      console.log('Run a deployment first using: npx hardhat run scripts/deploy.ts --network <network-name>');
      return;
    }
    
    // Read deployment data
    const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, 'utf8')) as DeploymentInfo[];
    console.log(chalk.green(`Found ${deploymentData.length} deployed contracts to verify.`));
    
    // Verify each contract
    const verificationPromises = deploymentData.map(async (deployment) => {
      try {
        console.log(chalk.yellow(`Verifying ${deployment.contractName} at ${deployment.address}...`));
        
        await hre.run('verify:verify', {
          address: deployment.address,
          constructorArguments: deployment.constructorArguments,
          contract: `contracts/${deployment.contractName}.sol:${deployment.contractName}`
        });
        
        console.log(chalk.green(`✓ ${deployment.contractName} verified successfully!`));
        return { success: true, contractName: deployment.contractName };
      } catch (error: any) {
        // Check if already verified
        if (error.message.includes('already verified')) {
          console.log(chalk.blue(`ℹ ${deployment.contractName} is already verified.`));
          return { success: true, contractName: deployment.contractName };
        }
        
        console.log(chalk.red(`✗ Failed to verify ${deployment.contractName}:`));
        console.log(error.message);
        return { success: false, contractName: deployment.contractName, error: error.message };
      }
    });
    
    // Wait for all verifications to complete
    const results = await Promise.all(verificationPromises);
    
    // Print summary
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;
    
    console.log('\n' + chalk.blue.bold('VERIFICATION SUMMARY'));
    console.log(chalk.blue('====================\n'));
    console.log(chalk.green(`✓ ${successCount} contracts verified successfully`));
    
    if (failCount > 0) {
      console.log(chalk.red(`✗ ${failCount} contracts failed verification`));
      console.log('\nFailed contracts:');
      results.filter(r => !r.success).forEach(r => {
        console.log(chalk.red(`- ${r.contractName}: ${r.error}`));
      });
    }
    
  } catch (error) {
    console.error(chalk.red(`Error during contract verification: ${error}`));
    process.exit(1);
  }
}

/**
 * Get the appropriate API key name for the given network
 */
function getApiKeyNameForNetwork(network: string): string | null {
  const networkToApiKeyMap: Record<string, string> = {
    'ethereum': 'ETHERSCAN_API_KEY',
    'mainnet': 'ETHERSCAN_API_KEY',
    'sepolia': 'ETHERSCAN_API_KEY',
    'goerli': 'ETHERSCAN_API_KEY',
    'polygon': 'POLYGONSCAN_API_KEY',
    'mumbai': 'POLYGONSCAN_API_KEY',
    'arbitrum': 'ARBISCAN_API_KEY',
    'optimism': 'OPTIMISM_API_KEY',
    'bsc': 'BSCSCAN_API_KEY'
  };
  
  const apiKeyName = networkToApiKeyMap[network];
  if (!apiKeyName || !process.env[apiKeyName]) {
    return null;
  }
  
  return apiKeyName;
}

// Run the script
verifyContracts().catch(error => {
  console.error(chalk.red(`Fatal error: ${error}`));
  process.exit(1);
});