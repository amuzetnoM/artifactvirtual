# Bedrock: Comprehensive Blockchain Development Environment

A complete development environment for building blockchain applications across multiple platforms and languages.

## Features

- **Multi-chain support**: Ethereum, Solana, Polkadot, Cardano, Bitcoin and more
- **Cross-language development**: Solidity, Rust, TypeScript, Vyper, Cairo, Plutus, and Bitcoin Script
- **Complete tooling**: Smart contract development, testing, deployment, and dApp creation
- **Educational resources**: Examples and documentation for different blockchain platforms

## Components

### Ethereum Development Tools
- **Hardhat**: Complete TypeScript-based development environment
- **Solidity contracts**: Example implementations with full test coverage
- **Deployment scripts**: Configurable for various networks
- **Testing framework**: Mocha and Chai setup with TypeScript

### Rust Blockchain Library
- **Unified blockchain interface**: Common API across multiple chains
- **Ethereum client**: Complete implementation using ethers.rs
- **Solana client**: RPC-based implementation for Solana
- **Utility modules**: Cryptography, encoding, and logging tools

### Documentation
- **Getting started guides**: For each blockchain platform
- **API references**: For the Rust and JavaScript libraries
- **Best practices**: Security, gas optimization, and development workflows
- **Full-stack dApp guide**: End-to-end application development

## Project Structure

The Bedrock environment follows a well-organized structure:

- **core/**: Language/tool documentation, shared configs, and reference code
- **contracts/**: Smart contracts in various languages (Solidity, Vyper, Cairo, Plutus)
- **scripts/**: Deployment, migration, and utility scripts (JS/TS, Rust, Python)
- **tests/**: Automated tests for contracts and protocols
- **clients/**: dApp frontends (React/Next.js, Svelte, etc.)
- **rust/**: Rust-based blockchain code (protocols, clients, tooling)
- **docs/**: Developer and user documentation

## Getting Started

### Prerequisites
- Node.js v20+ (we recommend using nvm for version management)
- Rust (via rustup) with wasm32-unknown-unknown target for smart contract compilation
- Python 3.9+ for Vyper development
- (Optional) Haskell Stack for Plutus development
- (Optional) Cairo toolchain for StarkNet development

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd bedrock

# Install JavaScript dependencies
npm install

# Install Rust toolchain (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# Add WebAssembly target for Rust-based smart contracts
rustup target add wasm32-unknown-unknown

# Install other language tools as needed
pip install vyper
```

### Environment Setup

```bash
# Create environment configuration from template
cp .env.example .env
# Edit .env file with your configuration (RPC URLs, private keys, etc.)
```

### Tool Installation

```bash
# Install Hardhat globally (optional)
npm install -g hardhat

# Install linting and formatting tools
npm install -D eslint prettier solhint

# Verify installations
npx hardhat --version
cargo --version
python -c "import vyper; print(vyper.__version__)"
```

## Quick Start Examples

### Ethereum Smart Contract Development

1. **Compile contracts**:
```bash
npm run compile
```

2. **Run tests**:
```bash
npm test
```

3. **Deploy to local network**:
```bash
npm run node          # In one terminal
npm run deploy:local  # In another terminal
```

### Using the Rust Blockchain Library

```rust
use bedrock_blockchain::{
    ethereum::EthereumClient,
    common::BlockchainClient,
    common::Address,
};

fn main() -> anyhow::Result<()> {
    // Create an Ethereum client
    let mut client = EthereumClient::new(
        "https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
        "mainnet",
        1, // Chain ID
    )?;
    
    // Get ETH balance of an address
    let address = Address::new("0x742d35Cc6634C0532925a3b844Bc454e4438f44e");
    let balance = client.get_balance(&address)?;
    println!("Balance: {}", balance);
    
    Ok(())
}
```

## Development Workflow

1. **Setup Environment**
   - Clone the repository and install dependencies
   - Configure your .env file with appropriate keys and endpoints

2. **Contract Development**
   - Write smart contracts in contracts/ directory
   - Use the appropriate language for your target blockchain
   - Run tests with `npm test` or `cargo test` for Rust components

3. **Deployment**
   - Configure network settings in hardhat.config.ts or appropriate config
   - Run deployment scripts using `npx hardhat run scripts/deploy.js --network <network-name>`

4. **Frontend Integration**
   - Develop dApp frontends in the clients/ directory
   - Use generated contract types for type-safe interaction

## Documentation

- [Ethereum Development Guide](./docs/ethereum-development.md)
- [Rust Blockchain Library](./docs/rust-blockchain-lib.md)
- [Full-Stack dApp Guide](./docs/fullstack-dapp-guide.md)
- [Project Setup Guide](./docs/project-setup-guide.md)
- [Troubleshooting Guide](./docs/troubleshooting.md)

## Supported Blockchain Languages & Technologies

### Smart Contract Languages
- **Solidity**: Ethereum and EVM-compatible chains
- **Vyper**: Security-focused alternative for EVM chains
- **Cairo**: For StarkNet (ZK-rollups)
- **Plutus**: Haskell-based language for Cardano
- **Marlowe**: DSL for financial contracts on Cardano
- **Bitcoin Script**: For Bitcoin transactions
- **Rust**: For Solana, NEAR, and other Rust-based chains

### Development Tools
- **Hardhat**: Ethereum development environment
- **Foundry**: Fast, portable Ethereum development toolkit
- **Truffle**: Development framework for Ethereum
- **Anchor**: Framework for Solana development
- **Cardano CLI**: Command line interface for Cardano

### Client Libraries
- **ethers.js/web3.js**: JavaScript libraries for Ethereum
- **@solana/web3.js**: JavaScript API for Solana
- **polkadot.js**: JavaScript API for Polkadot
- **cardano-serialization-lib**: Library for Cardano

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.