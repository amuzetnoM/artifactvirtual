# Ethereum Development Guide

This guide provides comprehensive information for Ethereum blockchain development using the Bedrock environment. It covers contract development, testing, deployment, and best practices.

## Table of Contents

1. [Getting Started with Ethereum Development](#getting-started-with-ethereum-development)
2. [Smart Contract Development](#smart-contract-development)
3. [Testing Smart Contracts](#testing-smart-contracts)
4. [Contract Deployment](#contract-deployment)
5. [Contract Verification](#contract-verification)
6. [Security Best Practices](#security-best-practices)
7. [Gas Optimization](#gas-optimization)
8. [Frontend Integration](#frontend-integration)
9. [Advanced Topics](#advanced-topics)
10. [Resources](#resources)

## Getting Started with Ethereum Development

### Prerequisites

Before starting Ethereum development, ensure you have:

- Node.js v20+ installed
- Hardhat environment set up
- Basic understanding of Solidity and JavaScript/TypeScript
- MetaMask or similar wallet for testing

### Environment Configuration

The Bedrock environment includes a pre-configured Hardhat setup. Key files:

- `hardhat.config.ts` - Network configuration and compiler settings
- `.env` - Environment variables for API keys and private keys
- `contracts/` - Directory for your Solidity contracts
- `scripts/` - Deployment and interaction scripts
- `tests/` - Test files

## Smart Contract Development

### Contract Structure

A typical Solidity smart contract structure:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
    
    // Contract functions...
}
```

### Solidity Best Practices

1. **Use Recent Compiler Version**
   - Always use an up-to-date Solidity compiler (^0.8.x recommended)
   - Take advantage of new security features

2. **Leverage OpenZeppelin**
   - Use [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/) for standard implementations
   - Avoid reinventing secure contract patterns

3. **Proper Error Handling**
   - Use custom errors for gas efficiency and better error messages
   ```solidity
   error InsufficientBalance(uint256 available, uint256 required);
   
   function withdraw(uint256 amount) external {
       if (balances[msg.sender] < amount) {
           revert InsufficientBalance({
               available: balances[msg.sender],
               required: amount
           });
       }
       // Function logic...
   }
   ```

4. **Event Logging**
   - Use events to track important state changes
   ```solidity
   event Transfer(address indexed from, address indexed to, uint256 amount);
   
   function transfer(address to, uint256 amount) external {
       // Transfer logic...
       emit Transfer(msg.sender, to, amount);
   }
   ```

### Using Vyper

For enhanced security in certain use cases, consider Vyper:

```python
# @version ^0.3.7
# @title Simple Storage Contract

storedData: public(uint256)

@external
def __init__(_initialValue: uint256):
    self.storedData = _initialValue

@external
def set(_value: uint256):
    self.storedData = _value

@view
@external
def get() -> uint256:
    return self.storedData
```

## Testing Smart Contracts

### Unit Tests

Use Hardhat's testing framework with Mocha and Chai:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { MyToken } from "../typechain-types";

describe("MyToken", function() {
  let myToken: MyToken;

  before(async function() {
    const MyTokenFactory = await ethers.getContractFactory("MyToken");
    myToken = await MyTokenFactory.deploy("My Token", "MTK") as MyToken;
    await myToken.deployed();
  });

  it("Should have correct name and symbol", async function() {
    expect(await myToken.name()).to.equal("My Token");
    expect(await myToken.symbol()).to.equal("MTK");
  });

  it("Should assign total supply to deployer", async function() {
    const [owner] = await ethers.getSigners();
    const totalSupply = await myToken.totalSupply();
    const ownerBalance = await myToken.balanceOf(owner.address);
    expect(ownerBalance).to.equal(totalSupply);
  });
});
```

### Test Coverage

Check your test coverage with the Hardhat coverage plugin:

```bash
npm install --save-dev solidity-coverage
```

Add to `hardhat.config.ts`:
```typescript
import "solidity-coverage";
```

Run coverage:
```bash
npx hardhat coverage
```

### Forking Mainnet

For testing with real-world contracts and state:

```typescript
// hardhat.config.ts
const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      forking: {
        url: process.env.ETHEREUM_MAINNET_RPC_URL || "",
        blockNumber: 15000000 // Optional: pin to a specific block
      }
    }
    // Other networks...
  }
};
```

## Contract Deployment

### Deploy Script

Create deployment scripts in the `scripts` directory:

```typescript
// scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying contracts...");

  // Deploy MyToken contract
  const MyToken = await ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy("My Token", "MTK");
  await myToken.deployed();

  console.log(`MyToken deployed to: ${myToken.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### Deployment Commands

Deploy to different networks:

```bash
# Deploy to local network
npx hardhat run scripts/deploy.ts --network localhost

# Deploy to testnet
npx hardhat run scripts/deploy.ts --network sepolia

# Deploy to mainnet
npx hardhat run scripts/deploy.ts --network mainnet
```

### Using Hardhat-Deploy

For more advanced deployment management, use `hardhat-deploy`:

```typescript
// deploy/01_deploy_token.ts
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("MyToken", {
    from: deployer,
    args: ["My Token", "MTK"],
    log: true,
    // Wait for transaction confirmations
    waitConfirmations: hre.network.name !== "hardhat" ? 5 : 0,
  });
};

func.tags = ["MyToken", "Token"];
export default func;
```

## Contract Verification

### Etherscan Verification

Verify your contracts on Etherscan for transparency:

```bash
# Verify with constructor arguments
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS "My Token" "MTK"
```

Configure Etherscan API key in `.env`:
```
ETHERSCAN_API_KEY=YourEtherscanApiKey
```

And add to `hardhat.config.ts`:
```typescript
const config: HardhatUserConfig = {
  // ...
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
```

### Automated Verification

You can automate verification in your deployment script:

```typescript
async function verify(contractAddress: string, args: any[]) {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    console.log("Verification error:", e);
  }
}
```

## Security Best Practices

### Common Vulnerabilities

1. **Reentrancy**
   - Always update state before making external calls
   - Use OpenZeppelin's ReentrancyGuard

2. **Integer Overflow/Underflow**
   - Solidity 0.8+ has built-in overflow/underflow checks
   - For earlier versions, use SafeMath

3. **Access Control**
   - Implement proper access control using modifiers
   - Use OpenZeppelin's AccessControl or Ownable patterns

4. **Oracle Manipulation**
   - Use multiple data sources
   - Implement time delays and circuit breakers

### Contract Auditing Tools

- **[Slither](https://github.com/crytic/slither)**: Static analyzer for Solidity
- **[MythX](https://mythx.io/)**: Security analysis platform
- **[Echidna](https://github.com/crytic/echidna)**: Fuzzing/property-based testing

## Gas Optimization

### Storage Optimization

- Use appropriate variable types (uint8 vs uint256)
- Pack variables to save storage slots
- Use bytes32 over string where possible
- Consider using `unchecked` blocks for operations that can't overflow

```solidity
// Before optimization
uint128 a;
uint256 b;
uint128 c;

// After optimization (packs a, c into one slot)
uint128 a;
uint128 c;
uint256 b;
```

### Function Optimization

- Mark functions as `view` or `pure` when appropriate
- Use `external` instead of `public` for functions not called internally
- Avoid unnecessary storage reads/writes
- Cache storage variables in memory when used multiple times

## Frontend Integration

### Using ethers.js

Connect to your deployed contracts using ethers.js:

```typescript
import { ethers } from "ethers";
import MyTokenArtifact from "../artifacts/contracts/MyToken.sol/MyToken.json";

// Connect to provider
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

// Create contract instance
const myTokenAddress = "0x..."; // Your deployed contract address
const myToken = new ethers.Contract(
  myTokenAddress,
  MyTokenArtifact.abi,
  signer
);

// Call contract functions
async function getBalance() {
  const balance = await myToken.balanceOf(await signer.getAddress());
  return ethers.utils.formatEther(balance);
}
```

### Contract Type Generation

Generate TypeScript types for your contracts to get type safety:

```bash
# First add the TypeScript bindings for your contracts
npm install --save-dev typechain @typechain/ethers-v5 @typechain/hardhat

# Update hardhat.config.ts
# import "@typechain/hardhat";

# Then run
npx hardhat typechain
```

Use the generated types:

```typescript
import { MyToken } from "../typechain-types";

// Create typed contract instance
const myToken = new ethers.Contract(
  myTokenAddress,
  MyTokenArtifact.abi,
  signer
) as MyToken;

// Now you get type checking and autocompletion
const decimals = await myToken.decimals();
```

## Advanced Topics

### Proxy Patterns

Use upgradeable contracts for flexibility:

```solidity
// Implementation contract
contract MyTokenV1 is ERC20 {
  // Logic implementation
}

// Proxy contract
contract MyTokenProxy {
  address public implementation;
  
  constructor(address _implementation) {
    implementation = _implementation;
  }
  
  fallback() external payable {
    address _impl = implementation;
    assembly {
      let ptr := mload(0x40)
      calldatacopy(ptr, 0, calldatasize())
      let result := delegatecall(gas(), _impl, ptr, calldatasize(), 0, 0)
      let size := returndatasize()
      returndatacopy(ptr, 0, size)
      switch result
      case 0 { revert(ptr, size) }
      default { return(ptr, size) }
    }
  }
}
```

For easier implementation, use OpenZeppelin's upgradeable contracts package.

### Layer 2 Integration

Interact with Layer 2 solutions (Optimism, Arbitrum) and sidechains:

```typescript
// hardhat.config.ts
const config: HardhatUserConfig = {
  networks: {
    arbitrum: {
      url: "https://arb1.arbitrum.io/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    optimism: {
      url: "https://mainnet.optimism.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};
```

## Resources

### Documentation

- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [ethers.js Documentation](https://docs.ethers.io/)

### Learning Resources

- [Ethereum.org Developer Resources](https://ethereum.org/developers/)
- [Solidity by Example](https://solidity-by-example.org/)
- [CryptoZombies](https://cryptozombies.io/)
- [Ethernaut](https://ethernaut.openzeppelin.com/)

### Tools

- [Remix](https://remix.ethereum.org/) - Online IDE
- [Tenderly](https://tenderly.co/) - Contract monitoring and debugging
- [Infura](https://infura.io/) - Ethereum API access
- [Alchemy](https://www.alchemy.com/) - Enhanced API access and developer tools