import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Default to empty string if environment variables are not set
const ETHEREUM_MAINNET_RPC_URL = process.env.ETHEREUM_MAINNET_RPC_URL || "";
const ETHEREUM_SEPOLIA_RPC_URL = process.env.ETHEREUM_SEPOLIA_RPC_URL || "";
const POLYGON_MAINNET_RPC_URL = process.env.POLYGON_MAINNET_RPC_URL || "";
const POLYGON_MUMBAI_RPC_URL = process.env.POLYGON_MUMBAI_RPC_URL || "";
const ARBITRUM_RPC_URL = process.env.ARBITRUM_RPC_URL || "";
const OPTIMISM_RPC_URL = process.env.OPTIMISM_RPC_URL || "";
const BSC_MAINNET_RPC_URL = process.env.BSC_MAINNET_RPC_URL || "";
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";

// API keys for block explorers
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY || "";
const OPTIMISM_API_KEY = process.env.OPTIMISM_API_KEY || "";
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || "";

// Gas configuration
const GAS_PRICE_GWEI = process.env.GAS_PRICE_GWEI || "20";
const GAS_LIMIT = process.env.GAS_LIMIT || "3000000";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: process.env.OPTIMIZER_ENABLED === "true" || true,
        runs: parseInt(process.env.OPTIMIZER_RUNS || "200")
      }
    }
  },
  networks: {
    hardhat: {
      forking: process.env.FORK_ENABLED === "true" ? {
        url: ETHEREUM_MAINNET_RPC_URL,
        blockNumber: process.env.FORKING_BLOCK_NUMBER ? parseInt(process.env.FORKING_BLOCK_NUMBER) : undefined
      } : undefined
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    ethereum: {
      url: ETHEREUM_MAINNET_RPC_URL,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
      chainId: 1,
      gasPrice: parseInt(GAS_PRICE_GWEI) * 1e9 || undefined,
      gas: parseInt(GAS_LIMIT) || undefined
    },
    sepolia: {
      url: ETHEREUM_SEPOLIA_RPC_URL,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: parseInt(GAS_PRICE_GWEI) * 1e9 || undefined,
      gas: parseInt(GAS_LIMIT) || undefined
    },
    polygon: {
      url: POLYGON_MAINNET_RPC_URL,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
      chainId: 137,
      gasPrice: parseInt(GAS_PRICE_GWEI) * 1e9 || undefined,
      gas: parseInt(GAS_LIMIT) || undefined
    },
    mumbai: {
      url: POLYGON_MUMBAI_RPC_URL,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
      chainId: 80001,
      gasPrice: parseInt(GAS_PRICE_GWEI) * 1e9 || undefined,
      gas: parseInt(GAS_LIMIT) || undefined
    },
    arbitrum: {
      url: ARBITRUM_RPC_URL,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
      chainId: 42161
    },
    optimism: {
      url: OPTIMISM_RPC_URL,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
      chainId: 10
    },
    bsc: {
      url: BSC_MAINNET_RPC_URL,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
      chainId: 56,
      gasPrice: parseInt(GAS_PRICE_GWEI) * 1e9 || undefined,
      gas: parseInt(GAS_LIMIT) || undefined
    }
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
      polygon: POLYGONSCAN_API_KEY,
      polygonMumbai: POLYGONSCAN_API_KEY,
      arbitrumOne: ARBISCAN_API_KEY,
      optimisticEthereum: OPTIMISM_API_KEY,
      bsc: BSCSCAN_API_KEY
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    outputFile: process.env.GAS_REPORTER_OUTPUT_FILE,
    noColors: process.env.GAS_REPORTER_NO_COLORS === "true",
  }
};

export default config;
