# Bedrock Troubleshooting Guide

This guide helps you diagnose and resolve common issues that may arise when using the Bedrock blockchain development environment.

## Table of Contents

1. [Node.js & Package Management Issues](#nodejs--package-management-issues)
2. [Hardhat & Ethereum Issues](#hardhat--ethereum-issues)
3. [Rust & WebAssembly Issues](#rust--webassembly-issues)
4. [Vyper & Python Issues](#vyper--python-issues)
5. [Cross-Chain Integration Issues](#cross-chain-integration-issues)
6. [Network Connectivity Problems](#network-connectivity-problems)
7. [Contract Compilation Errors](#contract-compilation-errors)
8. [Testing Framework Issues](#testing-framework-issues)
9. [Deployment Problems](#deployment-problems)
10. [VS Code & DevContainer Issues](#vs-code--devcontainer-issues)

## Node.js & Package Management Issues

### Error: Cannot find module 'X'

**Problem**: Missing dependencies in your project.

**Solution**:
```bash
# Reinstall node modules
rm -rf node_modules
npm install
```

### Error: Node version is not supported

**Problem**: Your Node.js version is incompatible with the project requirements.

**Solution**:
```bash
# If using nvm
nvm install 20
nvm use 20

# OR install Node.js v20+ from nodejs.org
```

### Package lock conflicts

**Problem**: Inconsistencies between package.json and package-lock.json.

**Solution**:
```bash
npm ci  # Performs a clean install using package-lock.json
```

## Hardhat & Ethereum Issues

### Error: HH108: Cannot connect to the network

**Problem**: Unable to connect to the specified Ethereum network.

**Solution**:
1. Check your network configuration in hardhat.config.ts
2. Verify your RPC URL in .env file
3. Check internet connectivity
4. Try an alternative RPC provider

```bash
# Test the RPC URL directly
curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' YOUR_RPC_URL
```

### Error: Invalid address or ENS name

**Problem**: Incorrect contract address format or unresolved ENS name.

**Solution**:
- Ensure addresses begin with '0x' and have 42 characters total (including '0x')
- Check that you're using the correct address for the network you're connected to

### Error: Transaction underpriced

**Problem**: Gas price is too low for the current network conditions.

**Solution**:
```javascript
// In your deployment script or transaction
const tx = await contract.function({
  gasPrice: ethers.utils.parseUnits('50', 'gwei'), // Increase gas price
  gasLimit: 3000000 // Set appropriate gas limit
});
```

### Error: Nonce too low

**Problem**: Transaction nonce mismatch, often happens when connecting to different networks.

**Solution**:
```bash
# Reset your local nonce tracking
npx hardhat clean

# Or specify nonce manually in your transaction
const tx = await contract.function({
  nonce: await ethers.provider.getTransactionCount(signer.address)
});
```

## Rust & WebAssembly Issues

### Error: rustc cannot find wasm32-unknown-unknown

**Problem**: WebAssembly target not installed in your Rust toolchain.

**Solution**:
```bash
rustup target add wasm32-unknown-unknown
```

### Error: cannot find macro `borsh::BorshSerialize` in this scope

**Problem**: Missing dependencies in your Rust project.

**Solution**:
```bash
# Add the missing dependency to Cargo.toml
# [dependencies]
# borsh = "0.10.0"

# Then run
cargo update
```

### Error: failed to run custom build command for `openssl-sys`

**Problem**: Missing OpenSSL development libraries.

**Solution**:
```bash
# On Ubuntu/Debian
sudo apt-get install libssl-dev pkg-config

# On macOS
brew install openssl@3 pkg-config
```

## Vyper & Python Issues

### Error: Vyper compiler not found

**Problem**: Vyper is not installed or not in PATH.

**Solution**:
```bash
pip install vyper
# Verify installation
vyper --version
```

### Error: Version mismatch between compiler and interface

**Problem**: Using incompatible Vyper compiler version for your contract.

**Solution**:
```bash
# Install specific Vyper version
pip install vyper==0.3.7

# Or add pragma to your Vyper contract
#@version ^0.3.7
```

## Cross-Chain Integration Issues

### Error: Invalid Solana address

**Problem**: Incorrect Solana address format.

**Solution**:
- Ensure Solana addresses are Base58 encoded and typically 32-44 characters long
- Use appropriate address validation

```javascript
// For JavaScript/TypeScript
import { PublicKey } from '@solana/web3.js';
try {
  new PublicKey(addressString);
  console.log('Valid Solana address');
} catch (e) {
  console.error('Invalid Solana address');
}
```

### Error: Chain ID mismatch

**Problem**: Connected to wrong chain or incorrect chain ID in configuration.

**Solution**:
- Verify chain IDs in hardhat.config.ts match the networks you intend to use
- Common Chain IDs:
  - Ethereum Mainnet: 1
  - Sepolia: 11155111
  - Polygon: 137
  - Arbitrum: 42161

## Network Connectivity Problems

### Error: ECONNREFUSED or timeout when connecting to RPC

**Problem**: Cannot connect to RPC endpoint.

**Solution**:
1. Check internet connectivity
2. Verify RPC URL is correct
3. Check if the RPC provider has rate limits or requires API keys
4. Try an alternative RPC provider

```bash
# Test direct connectivity
ping eth-mainnet.g.alchemy.com
```

### Error: Exceeded rate limit

**Problem**: Too many requests to RPC provider.

**Solution**:
- Implement request throttling in your code
- Use a paid tier for higher limits
- Distribute requests across multiple providers

## Contract Compilation Errors

### Error: Source file requires different compiler version

**Problem**: Hardhat compiler version doesn't match the pragma in your contract.

**Solution**:
```typescript
// In hardhat.config.ts
const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      { version: "0.8.24" },
      { version: "0.8.20" },
      { version: "0.7.6" }
    ]
  }
  // ...
};
```

### Error: Contract exceeds size limit

**Problem**: Contract bytecode exceeds the 24KB limit.

**Solution**:
- Split logic into multiple contracts
- Remove unused functions
- Optimize variable packing
- Use libraries for reused code
- Increase optimizer runs in compiler settings

## Testing Framework Issues

### Error: Test timeout

**Problem**: Tests are taking too long to complete.

**Solution**:
```typescript
// In hardhat.config.ts
const config: HardhatUserConfig = {
  mocha: {
    timeout: 60000 // Increase timeout to 60 seconds
  }
  // ...
};
```

### Error: Test reproduces inconsistently

**Problem**: Non-deterministic behavior in tests, often due to race conditions.

**Solution**:
- Add explicit waits for transactions to be mined
- Use `await ethers.provider.waitForTransaction(tx.hash)` after transactions
- Increase block time in hardhat configuration for more predictable timing

## Deployment Problems

### Error: Contract verification failed

**Problem**: Unable to verify contract on Etherscan or similar explorers.

**Solution**:
1. Make sure contract was compiled with optimization settings matching deployment
2. Ensure all constructor arguments are correctly formatted
3. Verify API key is correct in .env file

```bash
# Example with specific constructor arguments
npx hardhat verify --network sepolia CONTRACT_ADDRESS "Constructor Arg 1" 123
```

### Error: Gas estimation failed

**Problem**: Cannot estimate gas for transaction.

**Solution**:
- Check if your contract has infinite loops or unreachable revert conditions
- Manually specify gas limit in your transactions
- Check if you're using correct ABI

## VS Code & DevContainer Issues

### Error: DevContainer build fails

**Problem**: Issues with building the development container.

**Solution**:
1. Make sure Docker is running
2. Check Docker has sufficient resources allocated
3. Try rebuilding with "Rebuild without Cache" option
4. Check network connectivity for pulling container images

### Error: Solidity plugins not working

**Problem**: VS Code Solidity extensions not functioning correctly.

**Solution**:
1. Make sure you've installed recommended extensions
2. Set the appropriate Solidity compiler version in settings
3. Restart VS Code and/or reload window

```json
// In settings.json
{
  "solidity.compileUsingRemoteVersion": "v0.8.24+commit.e11b9ed9",
  "solidity.defaultCompiler": "remote"
}
```

---

If you encounter issues not covered in this guide, please:

1. Check the Hardhat documentation: https://hardhat.org/hardhat-runner/docs/getting-started
2. Review Rust documentation: https://doc.rust-lang.org/book/
3. Search for similar issues in the project's issue tracker
4. Join our community Discord or Telegram channels for support

For persistent problems, consider opening an issue with:
- A minimal reproducible example
- Your environment details (OS, Node version, Rust version, etc.)
- Steps to reproduce the issue
- Any error messages or logs