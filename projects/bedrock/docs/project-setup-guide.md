# Bedrock Project Setup Guide

This guide walks you through setting up a complete blockchain development environment using Bedrock. It covers all necessary steps from initial project structure to deployment readiness.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Environment Preparation](#environment-preparation)
3. [Dependency Installation](#dependency-installation)
4. [Project Initialization](#project-initialization)
5. [Configuration & Scripts](#configuration--scripts)
6. [Testing & Linting Setup](#testing--linting-setup)
7. [Documentation](#documentation)
8. [Version Control](#version-control)
9. [Codespace/Devcontainer Setup](#codespacedevcontainer-setup)
10. [Next Steps](#next-steps)

## Project Structure

Begin by creating the following folder structure. This organized layout ensures clear separation of concerns and supports multiple blockchain platforms and languages:

```
bedrock/
├── core/                # Language/tool documentation, shared configs, reference code
├── contracts/           # Smart contracts (Solidity, Vyper, Cairo, Plutus, etc.)
│   ├── ethereum/        # Ethereum contracts (Solidity, Vyper)
│   ├── solana/          # Solana contracts (Rust)
│   ├── cardano/         # Cardano contracts (Plutus)
│   └── starknet/        # StarkNet contracts (Cairo)
├── scripts/             # Deployment, migration, and utility scripts
│   ├── deploy/          # Deployment scripts
│   ├── utils/           # Utility scripts
│   └── migration/       # Migration scripts
├── tests/               # Automated tests
│   ├── unit/            # Unit tests
│   └── integration/     # Integration tests
├── clients/             # dApp frontends
│   ├── web/             # Web client
│   └── mobile/          # Mobile client
├── rust/                # Rust-based blockchain code
│   ├── common/          # Shared Rust code
│   ├── ethereum/        # Ethereum-specific Rust code
│   └── solana/          # Solana-specific Rust code
└── docs/                # Developer and user documentation
```

## Environment Preparation

### Node.js & NPM/Yarn/PNPM

1. **Install Node.js (v20+ recommended)**:
   - Download from [nodejs.org](https://nodejs.org/) or use a version manager
   
   ```bash
   # Using nvm (recommended for version management)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   # Restart your terminal, then:
   nvm install 20
   nvm use 20
   ```

2. **Choose a package manager**:
   - npm (comes with Node.js)
   - yarn: `npm install -g yarn`
   - pnpm: `npm install -g pnpm`

### Rust Toolchain

1. **Install Rust via rustup**:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Add WebAssembly target** (for smart contract compilation):
   ```bash
   rustup target add wasm32-unknown-unknown
   ```

### Solidity & Hardhat

1. **Install Hardhat**:
   ```bash
   # As a dev dependency in your project
   npm install --save-dev hardhat
   
   # Or globally (optional)
   npm install -g hardhat
   ```

2. **Install Hardhat plugins**:
   ```bash
   npm install --save-dev @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-ethers ethers hardhat-deploy @openzeppelin/contracts
   ```

### Other Languages/Tools

1. **Vyper** (Python-like smart contract language):
   ```bash
   pip install vyper
   ```

2. **Cairo** (for StarkNet):
   - Follow the [official StarkNet documentation](https://docs.starknet.io/documentation/tools/cairo-language/)
   
3. **Plutus/Marlowe** (for Cardano):
   - Install [Haskell toolchain](https://www.haskell.org/ghcup/)
   - Install [Cardano CLI](https://developers.cardano.org/docs/get-started/installing-cardano-node/)

4. **Bitcoin Script**:
   - No specific installation needed, but reference tools may be used

### Web3 Libraries

1. **Install Ethereum libraries**:
   ```bash
   npm install ethers@6 web3 @types/web3
   ```

2. **Install Solana libraries** (if needed):
   ```bash
   npm install @solana/web3.js
   ```

### Testing & Linting

1. **JavaScript/TypeScript**:
   ```bash
   npm install --save-dev eslint prettier mocha chai ts-node typescript @types/node @types/mocha @types/chai
   ```

2. **Rust**:
   - Tools come with rustup: `cargo test`, `cargo clippy`, `cargo fmt`

## Dependency Installation

After setting up the initial environment, install the project dependencies:

1. **Initialize a new Node.js project**:
   ```bash
   npm init -y
   ```

2. **Update package.json** with appropriate metadata and scripts.

3. **Install TypeScript** (recommended):
   ```bash
   npm install --save-dev typescript
   npx tsc --init
   ```

## Project Initialization

1. **Initialize Hardhat**:
   ```bash
   npx hardhat init
   # Select "Create a TypeScript project" when prompted
   ```

2. **Set up Rust workspace**:
   ```bash
   # In the rust/ directory
   echo '[workspace]
   members = [
     "common",
     "ethereum",
     "solana"
   ]' > Cargo.toml
   
   # Create sub-packages
   mkdir -p common ethereum solana
   cd common && cargo init --lib
   cd ../ethereum && cargo init --lib
   cd ../solana && cargo init --lib
   ```

3. **Add example contracts**:
   - Place example Solidity contracts in `contracts/ethereum/`
   - Place example Vyper contracts in `contracts/ethereum/vyper/`
   - Place example Solana Rust contracts in `contracts/solana/`
   - Place example Cairo contracts in `contracts/starknet/`

## Configuration & Scripts

1. **Create environment variable template**:
   ```bash
   # Create .env.example
   cat > .env.example << 'EOF'
   # Network RPC URLs
   ETHEREUM_MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_API_KEY
   ETHEREUM_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
   SOLANA_DEVNET_RPC_URL=https://api.devnet.solana.com
   
   # Private keys (DO NOT COMMIT ACTUAL PRIVATE KEYS)
   DEPLOYER_PRIVATE_KEY=0xYourPrivateKeyHere
   
   # API Keys
   ETHERSCAN_API_KEY=YourEtherscanApiKeyHere
   
   # Gas settings
   GAS_PRICE_GWEI=20
   GAS_LIMIT=3000000
   EOF
   
   cp .env.example .env
   echo ".env" >> .gitignore
   ```

2. **Add scripts to package.json**:
   ```json
   "scripts": {
     "compile": "hardhat compile",
     "test": "hardhat test",
     "node": "hardhat node",
     "deploy:local": "hardhat run scripts/deploy.js --network localhost",
     "deploy:sepolia": "hardhat run scripts/deploy.js --network sepolia",
     "deploy:mainnet": "hardhat run scripts/deploy.js --network mainnet",
     "verify": "hardhat verify",
     "lint": "eslint '**/*.{js,ts}'",
     "format": "prettier --write '**/*.{js,ts,sol,json,md}'"
   }
   ```

3. **Configure Hardhat** (hardhat.config.ts):
   ```typescript
   import { HardhatUserConfig } from "hardhat/config";
   import "@nomicfoundation/hardhat-toolbox";
   import "@nomicfoundation/hardhat-ethers";
   import "hardhat-deploy";
   import * as dotenv from "dotenv";
   
   dotenv.config();
   
   const config: HardhatUserConfig = {
     solidity: {
       version: "0.8.24",
       settings: {
         optimizer: {
           enabled: true,
           runs: 200
         }
       }
     },
     networks: {
       hardhat: {},
       localhost: {
         url: "http://127.0.0.1:8545"
       },
       sepolia: {
         url: process.env.ETHEREUM_SEPOLIA_RPC_URL || "",
         accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : []
       },
       mainnet: {
         url: process.env.ETHEREUM_MAINNET_RPC_URL || "",
         accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
         gasPrice: Number(process.env.GAS_PRICE_GWEI || "20") * 1e9
       }
     },
     etherscan: {
       apiKey: process.env.ETHERSCAN_API_KEY
     },
     paths: {
       sources: "./contracts",
       tests: "./tests",
       cache: "./cache",
       artifacts: "./artifacts"
     }
   };
   
   export default config;
   ```

4. **Add TypeScript configuration** (tsconfig.json):
   ```json
   {
     "compilerOptions": {
       "target": "es2020",
       "module": "commonjs",
       "esModuleInterop": true,
       "forceConsistentCasingInFileNames": true,
       "strict": true,
       "skipLibCheck": true,
       "resolveJsonModule": true,
       "outDir": "dist"
     },
     "include": ["./scripts", "./tests", "./typechain-types"],
     "files": ["./hardhat.config.ts"]
   }
   ```

5. **Add Rust toolchain configuration** (rust-toolchain.toml):
   ```toml
   [toolchain]
   channel = "stable"
   components = ["rustfmt", "clippy"]
   targets = ["wasm32-unknown-unknown"]
   ```

## Testing & Linting Setup

1. **Configure ESLint** (.eslintrc.js):
   ```javascript
   module.exports = {
     root: true,
     parser: "@typescript-eslint/parser",
     plugins: ["@typescript-eslint"],
     extends: [
       "eslint:recommended",
       "plugin:@typescript-eslint/recommended"
     ],
     env: {
       node: true,
       mocha: true
     },
     rules: {
       // Add custom rules here
     }
   };
   ```

2. **Configure Prettier** (.prettierrc):
   ```json
   {
     "singleQuote": true,
     "trailingComma": "es5",
     "tabWidth": 2,
     "semi": true,
     "printWidth": 100
   }
   ```

3. **Add example test** (tests/unit/Token.test.ts):
   ```typescript
   import { expect } from "chai";
   import { ethers } from "hardhat";
   
   describe("Token Contract", function() {
     it("Should deploy the token with the correct name and symbol", async function() {
       const Token = await ethers.getContractFactory("Token");
       const token = await Token.deploy("MyToken", "MTK");
       await token.deployed();
       
       expect(await token.name()).to.equal("MyToken");
       expect(await token.symbol()).to.equal("MTK");
     });
   });
   ```

## Documentation

1. **Create detailed README.md**:
   - Include overview of project
   - Setup instructions
   - Usage examples
   - Contribution guidelines

2. **Add platform-specific documentation** in the docs/ directory:
   - Ethereum development guide
   - Solana development guide
   - Multi-chain integration guide
   - API reference

## Version Control

1. **Create a comprehensive .gitignore**:
   ```bash
   # Create .gitignore
   cat > .gitignore << 'EOF'
   # Node.js
   node_modules/
   npm-debug.log
   yarn-error.log
   
   # Hardhat
   cache/
   artifacts/
   typechain-types/
   
   # Environment variables
   .env
   
   # Rust
   target/
   Cargo.lock
   **/*.rs.bk
   
   # Python
   __pycache__/
   *.py[cod]
   *$py.class
   .Python
   env/
   venv/
   
   # IDE and editors
   .idea/
   .vscode/
   *.swp
   *.swo
   
   # Build outputs
   dist/
   build/
   
   # Logs
   logs/
   *.log
   EOF
   ```

2. **Commit the initial structure and configs**:
   ```bash
   git init
   git add .
   git commit -m "Initial project setup"
   ```

## Codespace/Devcontainer Setup

For reproducible development environments (optional):

1. **Create basic devcontainer configuration**:
   ```bash
   mkdir -p .devcontainer
   cat > .devcontainer/devcontainer.json << 'EOF'
   {
     "name": "Bedrock Blockchain Development",
     "image": "mcr.microsoft.com/devcontainers/universal:2",
     "features": {
       "ghcr.io/devcontainers/features/node:1": {
         "version": "20"
       },
       "ghcr.io/devcontainers/features/rust:1": {},
       "ghcr.io/devcontainers/features/python:1": {
         "version": "3.10"
       }
     },
     "postCreateCommand": "npm install && pip install vyper",
     "customizations": {
       "vscode": {
         "extensions": [
           "juanblanco.solidity",
           "dbaeumer.vscode-eslint",
           "esbenp.prettier-vscode",
           "rust-lang.rust-analyzer",
           "ms-python.python"
         ]
       }
     }
   }
   EOF
   ```

## Next Steps

After completing the basic setup:

1. **Add CI/CD workflows** (GitHub Actions)
2. **Build sample dApp frontend** in clients/ directory
3. **Expand contract examples**:
   - NFT implementations (ERC721, ERC1155)
   - DeFi protocols (AMM, lending platforms)
   - DAO governance systems
4. **Create React/Next.js frontend templates**
5. **Implement blockchain indexing services**
6. **Add cross-chain bridge examples**
7. **Build API servers that leverage the Rust library**

By following this setup guide, you'll have a complete blockchain development environment that supports multiple chains, languages, and frameworks.