// Blockchain utility functions for deployment, verification, and interaction
import { ethers } from 'ethers';

// Network RPC URL mapping
const NETWORK_RPC_URLS: Record<string, string> = {
  ethereum: process.env.ETHEREUM_MAINNET_RPC_URL || "https://eth-mainnet.g.alchemy.com/v2/demo",
  sepolia: process.env.ETHEREUM_SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/demo",
  polygon: process.env.POLYGON_MAINNET_RPC_URL || "https://polygon-mainnet.g.alchemy.com/v2/demo",
  mumbai: process.env.POLYGON_MUMBAI_RPC_URL || "https://polygon-mumbai.g.alchemy.com/v2/demo",
  arbitrum: process.env.ARBITRUM_RPC_URL || "https://arb-mainnet.g.alchemy.com/v2/demo",
  optimism: process.env.OPTIMISM_RPC_URL || "https://opt-mainnet.g.alchemy.com/v2/demo",
  bsc: process.env.BSC_MAINNET_RPC_URL || "https://bsc-dataseed1.binance.org",
};

// Network currency symbols
const NETWORK_CURRENCY_SYMBOLS: Record<string, string> = {
  ethereum: "ETH",
  sepolia: "ETH",
  polygon: "MATIC",
  mumbai: "MATIC",
  arbitrum: "ETH",
  optimism: "ETH",
  bsc: "BNB",
};

// Network block explorer URLs
const NETWORK_EXPLORERS: Record<string, string> = {
  ethereum: "https://etherscan.io",
  sepolia: "https://sepolia.etherscan.io",
  polygon: "https://polygonscan.com",
  mumbai: "https://mumbai.polygonscan.com",
  arbitrum: "https://arbiscan.io",
  optimism: "https://optimistic.etherscan.io",
  bsc: "https://bscscan.com",
};

/**
 * Get a provider for the specified network
 */
export function getProvider(network: string): ethers.providers.JsonRpcProvider {
  const rpcUrl = NETWORK_RPC_URLS[network] || NETWORK_RPC_URLS.ethereum;
  return new ethers.providers.JsonRpcProvider(rpcUrl);
}

/**
 * Get a wallet instance for the specified network
 */
export function getWallet(network: string, privateKey?: string): ethers.Wallet {
  const provider = getProvider(network);
  // Use provided private key or a randomly generated one (for read-only operations)
  const walletPrivateKey = privateKey || ethers.Wallet.createRandom().privateKey;
  return new ethers.Wallet(walletPrivateKey, provider);
}

/**
 * Deploy a contract to the blockchain
 */
export async function deployContract(
  abi: string, 
  bytecode: string, 
  network: string,
  privateKey?: string,
  constructorArgs: any[] = []
): Promise<{
  address: string;
  transactionHash: string;
  gasUsed: string;
}> {
  try {
    // Get a wallet for the specified network
    const wallet = getWallet(network, privateKey);
    
    // Create a contract factory
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    
    // Deploy the contract with constructor arguments
    const contract = await factory.deploy(...constructorArgs);
    
    // Wait for deployment to complete
    const receipt = await contract.deployTransaction.wait();
    
    return {
      address: contract.address,
      transactionHash: receipt.transactionHash,
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error) {
    console.error("Deployment error:", error);
    throw new Error(`Failed to deploy contract: ${error.message}`);
  }
}

/**
 * Verify a contract on Etherscan or similar explorer
 */
export async function verifyContract(
  address: string,
  sourceCode: string,
  network: string
): Promise<boolean> {
  // In a production environment, this would use the explorer's API
  // For now we'll use a simulated success with a note about real implementation
  console.log(`Contract verification would use ${NETWORK_EXPLORERS[network]}/api to verify contract at ${address}`);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1500);
  });
}

/**
 * Extract function definitions from ABI
 */
export async function getContractFunctions(abi: string): Promise<any[]> {
  try {
    const parsedABI = JSON.parse(abi);
    return parsedABI.filter((item: any) => item.type === "function");
  } catch (error) {
    console.error("Error parsing ABI:", error);
    return [];
  }
}

/**
 * Call a read-only function on a contract
 */
export async function callContractFunction(
  address: string,
  abi: string,
  functionName: string,
  args: any[],
  network: string
): Promise<any> {
  try {
    const provider = getProvider(network);
    const contract = new ethers.Contract(address, abi, provider);
    
    if (!contract.functions[functionName]) {
      throw new Error(`Function ${functionName} not found in contract`);
    }
    
    const result = await contract.functions[functionName](...args);
    
    // Format BigNumber results to strings for easier display
    if (ethers.BigNumber.isBigNumber(result[0])) {
      return result[0].toString();
    }
    
    return result[0]; // Most functions return an array of results, we take the first
  } catch (error) {
    console.error(`Error calling function ${functionName}:`, error);
    throw new Error(`Failed to call ${functionName}: ${error.message}`);
  }
}

/**
 * Send a transaction to a contract function that modifies state
 */
export async function sendContractTransaction(
  address: string,
  abi: string,
  functionName: string,
  args: any[],
  network: string,
  privateKey?: string
): Promise<string> {
  try {
    const wallet = getWallet(network, privateKey);
    const contract = new ethers.Contract(address, abi, wallet);
    
    if (!contract.functions[functionName]) {
      throw new Error(`Function ${functionName} not found in contract`);
    }
    
    // Send the transaction
    const tx = await contract.functions[functionName](...args);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    
    return receipt.transactionHash;
  } catch (error) {
    console.error(`Error sending transaction to ${functionName}:`, error);
    throw new Error(`Failed to send transaction to ${functionName}: ${error.message}`);
  }
}

/**
 * Get current network statistics
 */
export async function getNetworkStats(network: string): Promise<{
  gasPrice: string;
  latestBlock: string;
  tps: string;
  nativeTokenPrice: string;
}> {
  try {
    const provider = getProvider(network);
    
    // Get gas price
    const gasPrice = await provider.getGasPrice();
    const gasPriceInGwei = ethers.utils.formatUnits(gasPrice, "gwei");
    
    // Get latest block
    const latestBlockNumber = await provider.getBlockNumber();
    
    // TPS is complex to calculate accurately, so we'll use placeholder values
    // In a production app, this would be calculated from block times or fetched from an API
    const tpsEstimates: Record<string, string> = {
      ethereum: "15-30",
      sepolia: "15-30",
      polygon: "65-70",
      mumbai: "65-70",
      arbitrum: "75-100",
      optimism: "50-100",
      bsc: "50-60",
    };
    
    // Native token price would be fetched from an API like CoinGecko
    // For now we'll use placeholder values
    const tokenPrices: Record<string, string> = {
      ethereum: "$3,145.67",
      sepolia: "N/A (testnet)",
      polygon: "$0.85",
      mumbai: "N/A (testnet)",
      arbitrum: "N/A (L2)",
      optimism: "N/A (L2)",
      bsc: "$325.45",
    };
    
    return {
      gasPrice: `${parseFloat(gasPriceInGwei).toFixed(2)} Gwei`,
      latestBlock: latestBlockNumber.toLocaleString(),
      tps: tpsEstimates[network] || "Unknown",
      nativeTokenPrice: tokenPrices[network] || "Unknown",
    };
  } catch (error) {
    console.error("Error fetching network stats:", error);
    return {
      gasPrice: "Unknown",
      latestBlock: "Unknown",
      tps: "Unknown",
      nativeTokenPrice: "Unknown",
    };
  }
}

/**
 * Get transaction history for an address
 */
export async function getTransactionHistory(network: string, address?: string): Promise<any[]> {
  // For now we'll return mock data as this requires an external API or indexing service
  // In a production app, you would use Etherscan API, The Graph, or similar
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          from: "0x1234567890abcdef1234567890abcdef12345678",
          to: "0xabcdef1234567890abcdef1234567890abcdef12",
          value: `0.1 ${NETWORK_CURRENCY_SYMBOLS[network] || "ETH"}`,
          status: "confirmed",
          timestamp: "2 mins ago",
        },
        {
          hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          from: "0xabcdef1234567890abcdef1234567890abcdef12",
          to: "0x1234567890abcdef1234567890abcdef12345678",
          value: `0.05 ${NETWORK_CURRENCY_SYMBOLS[network] || "ETH"}`,
          status: "confirmed",
          timestamp: "10 mins ago",
        },
        {
          hash: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
          from: "0x1234567890abcdef1234567890abcdef12345678",
          to: "0xfedcba9876543210fedcba9876543210fedcba98",
          value: `0.2 ${NETWORK_CURRENCY_SYMBOLS[network] || "ETH"}`,
          status: "pending",
          timestamp: "just now",
        },
      ]);
    }, 1000);
  });
}

/**
 * Get blockchain explorer URL for the given network and resource
 */
export function getExplorerUrl(network: string, type: 'address' | 'tx', value: string): string {
  const baseUrl = NETWORK_EXPLORERS[network] || NETWORK_EXPLORERS.ethereum;
  return `${baseUrl}/${type}/${value}`;
}
