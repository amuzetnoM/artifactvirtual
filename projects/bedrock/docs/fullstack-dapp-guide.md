# Full-Stack dApp Development with Bedrock

This guide walks through building a complete decentralized application (dApp) using the Bedrock blockchain environment, combining smart contracts, backend services, and frontend interfaces.

## Architecture Overview

A complete Bedrock dApp consists of:

1. **Smart Contracts** - Solidity code deployed on Ethereum or EVM-compatible chains
2. **Backend Services** - Rust-based indexers, APIs, and blockchain interfaces
3. **Frontend Client** - TypeScript/JavaScript web application 

## Development Workflow

### 1. Define Requirements

Start by defining the core functionality of your dApp:
- What problem does it solve?
- Which blockchains will it support?
- What user interactions are required?
- What data needs to be stored on-chain vs. off-chain?

### 2. Smart Contract Development

#### a. Design Contract Architecture
- Identify required contracts and their relationships
- Choose appropriate standards (ERC20, ERC721, etc.)
- Plan for upgradability if needed

#### b. Implement Contracts
Use the Bedrock Hardhat environment to develop your contracts:

```bash
# Initialize contract development
npm run compile

# Run a local node for testing
npm run node
```

#### c. Test Contracts
Write comprehensive tests for all contract functionality:

```bash
# Run contract tests
npm test
```

#### d. Audit and Optimize
- Use static analysis tools (Slither, Mythril)
- Optimize for gas efficiency
- Consider formal verification for critical components

### 3. Backend Development

#### a. Blockchain Interaction Layer
Use the Bedrock Rust library to interact with blockchain networks:

```rust
use bedrock_blockchain::{ethereum::EthereumClient, common::BlockchainClient};

// Create a client for specified network
let client = EthereumClient::new(
    "https://mainnet.infura.io/v3/YOUR_API_KEY",
    "mainnet", 
    1
)?;

// Interact with the blockchain
let block_number = client.get_block_number()?;
println!("Current block: {}", block_number);
```

#### b. Indexing and Data Processing
Implement indexing services to track on-chain events:

```rust
// Example of processing contract events
async fn process_events(client: &EthereumClient, contract_address: H160) -> Result<()> {
    let filter = client.provider()
        .event_filter()
        .address(contract_address)
        .from_block(BlockNumber::Latest);
        
    let logs = client.provider().get_logs(&filter).await?;
    
    for log in logs {
        // Process each event log
        handle_log(&log)?;
    }
    
    Ok(())
}
```

#### c. API Development
Create REST or GraphQL APIs to serve processed blockchain data:

```rust
use warp::Filter;

// Example of a Warp API endpoint that returns blockchain data
async fn run_api_server() {
    let api = warp::path("api")
        .and(warp::path("blocks"))
        .and(warp::path::param())
        .and_then(get_block_info);
        
    warp::serve(api).run(([127, 0, 0, 1], 3030)).await;
}
```

### 4. Frontend Development

#### a. Setup Project
Use the clients directory to set up a modern frontend:

```bash
cd clients
npm init vite@latest my-dapp -- --template react-ts
cd my-dapp
npm install
```

#### b. Connect to Web3
Add blockchain connection using ethers.js:

```typescript
import { ethers } from 'ethers';
import MyTokenABI from '../artifacts/contracts/MyToken.sol/MyToken.json';

// Connect to provider
const provider = new ethers.providers.Web3Provider(window.ethereum);

// Request account access
await window.ethereum.request({ method: 'eth_requestAccounts' });
const signer = provider.getSigner();

// Connect to contract
const contractAddress = '0x...';
const tokenContract = new ethers.Contract(
  contractAddress,
  MyTokenABI.abi,
  signer
);

// Read contract data
const balance = await tokenContract.balanceOf(await signer.getAddress());
console.log(`Balance: ${ethers.utils.formatEther(balance)} tokens`);
```

#### c. Build User Interface
Create a responsive UI for your dApp using React, Vue, or other frameworks:

```tsx
function App() {
  const [balance, setBalance] = useState<string>('0');
  const [connected, setConnected] = useState<boolean>(false);

  async function connectWallet() {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setConnected(true);
        await updateBalance();
      } catch (error) {
        console.error("User rejected connection", error);
      }
    } else {
      alert("Please install MetaMask to use this dApp");
    }
  }

  async function updateBalance() {
    // Implementation
  }

  return (
    <div className="app">
      <header>
        <h1>My Bedrock dApp</h1>
        <button onClick={connectWallet}>
          {connected ? 'Connected' : 'Connect Wallet'}
        </button>
      </header>
      <main>
        <div className="balance-card">
          <h2>Your Balance</h2>
          <p>{balance} tokens</p>
        </div>
        {/* Other UI components */}
      </main>
    </div>
  );
}
```

### 5. Integration and Testing

#### a. Local Development Environment
Run a complete local environment:

```bash
# Terminal 1: Local blockchain node
npm run node

# Terminal 2: Backend services
cd rust
cargo run --bin api-server

# Terminal 3: Frontend
cd clients/my-dapp
npm run dev
```

#### b. End-to-End Testing
Test the complete flow from smart contract through backend to frontend.

#### c. Deployment Preparation
- Prepare contract verification scripts
- Set up CI/CD pipeline for backend and frontend
- Plan monitoring and maintenance strategy

### 6. Deployment

#### a. Deploy Smart Contracts
Deploy to testnets first, then mainnet:

```bash
# Deploy to testnet
npm run deploy:sepolia

# Deploy to mainnet (after thorough testing)
npm run deploy:mainnet
```

#### b. Deploy Backend Services
- Set up server infrastructure (cloud provider or on-premises)
- Deploy Rust services with proper monitoring
- Configure environment variables for production

#### c. Deploy Frontend
- Build optimized frontend assets
- Deploy to hosting service (Netlify, Vercel, AWS, etc.)
- Set up analytics and monitoring

## Advanced Topics

### Cross-Chain dApps

To support multiple blockchains in your dApp:

1. **Abstract Chain-Specific Logic**
   - Use the Bedrock blockchain agnostic interfaces
   - Create chain-specific adapters for contracts

2. **Bridge Integration**
   - Integrate with cross-chain bridges for asset transfers
   - Implement cross-chain messaging if needed

3. **Multi-Chain UX**
   - Allow users to select networks
   - Show appropriate UX for each supported chain

### Scalability Considerations

1. **Layer 2 Solutions**
   - Support for Optimism, Arbitrum, etc.
   - Implement proper L2 transaction handling

2. **Indexing at Scale**
   - Efficient event processing and indexing
   - Database sharding and optimization

3. **Frontend Performance**
   - Implement caching strategies
   - Use efficient data fetching patterns

## Conclusion

Building full-stack dApps with Bedrock provides a consistent, reliable development experience across the entire blockchain stack. By following this guide, developers can create robust, maintainable applications that harness the power of decentralized technology.

For more specific guidance, refer to the other documentation files:
- [Ethereum Development Guide](./ethereum-development.md)
- [Rust Blockchain Library](./rust-blockchain-lib.md)