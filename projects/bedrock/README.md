# Bedrock: Comprehensive Blockchain Development Environment

A complete development environment for building blockchain applications across multiple platforms and languages.

## Features

- **Multi-chain support**: Ethereum, Solana, Polkadot, Cardano, Bitcoin and more
- **Cross-language development**: Solidity, Rust, TypeScript, Vyper, Cairo, Plutus, and Bitcoin Script
- **Complete tooling**: Smart contract development, testing, deployment, and dApp creation
- **Educational resources**: Examples and documentation for different blockchain platforms

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

## Getting Started

1. **Prerequisites**: 
   - Node.js v20+
   - Rust (via rustup)
   - Python 3.9+
   - (Optional) Haskell Stack for Plutus development

2. **Installation**:
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd bedrock
   
   # Install JavaScript dependencies
   npm install
   
   # Install Rust toolchain (if not already installed)
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   
   # Install other language tools as needed
   pip install vyper
   ```

3. **Setup Environment**:
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

## Directory Structure

- **contracts/**: Smart contracts in various languages
- **scripts/**: Deployment, migration, and utility scripts
- **tests/**: Automated tests for contracts
- **clients/**: dApp frontends
- **rust/**: Rust-based blockchain code
- **docs/**: Documentation
- **core/**: Common utilities and configuration

## Usage Examples

Check the `docs` directory for detailed usage examples for each blockchain platform.

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.