# Rust Blockchain Library Guide

A comprehensive guide to the Bedrock Rust blockchain interface, a unified library for interacting with multiple blockchain networks through a consistent API.

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Core Components](#core-components)
5. [Blockchain Clients](#blockchain-clients)
6. [Advanced Usage](#advanced-usage)
7. [Performance Optimization](#performance-optimization)
8. [Error Handling](#error-handling)
9. [Testing and Mocking](#testing-and-mocking)
10. [Extension and Customization](#extension-and-customization)

## Introduction

The Bedrock Rust blockchain library provides a unified interface for interacting with multiple blockchain networks, enabling developers to write cross-chain applications with minimal overhead. This guide covers how to use the library effectively for building blockchain applications.

### Key Features

- **Blockchain Agnostic**: Common interfaces for multiple chains
- **Type Safety**: Leveraging Rust's type system for blockchain interactions
- **Performance Focused**: Optimized for high-throughput applications
- **Error Handling**: Comprehensive error management
- **Extensible**: Easy to add support for additional blockchains

### Supported Blockchains

- Ethereum and EVM-compatible chains
- Solana
- Polkadot (via feature flag)
- Bitcoin (coming soon)
- Cardano (coming soon)

## Architecture

The library is organized into modular components with a shared interface:

```
bedrock_blockchain
├── common/             # Shared traits and types
├── ethereum/           # Ethereum client implementation
├── solana/             # Solana client implementation
├── utils/              # Shared utilities
│   ├── crypto/         # Cryptography utilities
│   ├── encoding/       # Data encoding/decoding
│   └── logging/        # Logging utilities
└── lib.rs              # Main library entrypoint
```

The architecture follows these design principles:

1. **Trait-based abstraction** - All blockchain clients implement the `BlockchainClient` trait
2. **Chain-specific optimizations** - Each chain has optimized implementations under a unified API
3. **Minimal dependencies** - Core functionality has minimal dependencies to reduce bloat
4. **Feature flags** - Optional components can be enabled via Cargo features

## Getting Started

### Adding to Your Project

Add the library to your `Cargo.toml`:

```toml
[dependencies]
bedrock_blockchain = "0.1.0"

# For specific blockchain support only
# bedrock_blockchain = { version = "0.1.0", default-features = false, features = ["ethereum"] }
```

### Basic Usage

Here's a simple example of using the library to interact with Ethereum:

```rust
use bedrock_blockchain::{
    ethereum::EthereumClient,
    common::{BlockchainClient, Address},
};
use anyhow::Result;

fn main() -> Result<()> {
    // Initialize the library
    bedrock_blockchain::init()?;
    
    // Create an Ethereum client
    let mut client = EthereumClient::new(
        "https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
        "mainnet",
        1, // Chain ID
    )?;
    
    // Get an account balance
    let address = Address::new("0x742d35Cc6634C0532925a3b844Bc454e4438f44e");
    let balance = client.get_balance(&address)?;
    
    println!("Account balance: {}", balance);
    
    Ok(())
}
```

### Environment Setup

The library uses environment variables for configuration. Create a `.env` file:

```
ETHEREUM_MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
SOLANA_MAINNET_RPC_URL=https://api.mainnet-beta.solana.com
LOG_LEVEL=info
```

## Core Components

### Common Types

The library provides common types for cross-chain compatibility:

#### Address

```rust
// Universal address representation
let eth_address = Address::new("0x742d35Cc6634C0532925a3b844Bc454e4438f44e");
let sol_address = Address::new("HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH");
```

#### Transaction

```rust
// Chain-agnostic transaction
let tx = Transaction {
    hash: String::new(), // Will be filled when sent
    from: Some(Address::new("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")),
    to: Some(Address::new("0x1f9840a85d5af5bf1d1762f925bdaddc4201f984")),
    value: "1000000000000000000".to_string(), // 1 ETH in wei
    data: vec![],
    chain_id: Some(1),
};
```

### BlockchainClient Trait

All blockchain clients implement this core trait:

```rust
pub trait BlockchainClient: Debug + Send + Sync {
    fn get_balance(&self, address: &Address) -> Result<String>;
    fn send_transaction(&self, transaction: &Transaction) -> Result<String>;
    fn get_transaction_status(&self, tx_hash: &str) -> Result<TransactionStatus>;
    fn get_block_number(&self) -> Result<u64>;
    fn connect(&mut self) -> Result<()>;
    fn disconnect(&mut self) -> Result<()>;
}
```

## Blockchain Clients

### Ethereum Client

The `EthereumClient` provides Ethereum-specific functionality:

```rust
use bedrock_blockchain::{ethereum::EthereumClient, common::BlockchainClient};

// Create client
let client = EthereumClient::new(
    "https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
    "mainnet",
    1,
)?;

// Get current block number
let block_number = client.get_block_number()?;
println!("Current block: {}", block_number);

// Check transaction status
let status = client.get_transaction_status("0x1234...")?;
match status {
    TransactionStatus::Confirmed => println!("Transaction confirmed"),
    TransactionStatus::Pending => println!("Transaction pending"),
    TransactionStatus::Failed => println!("Transaction failed"),
    _ => println!("Unknown status"),
}
```

#### Ethereum-Specific Methods

The `EthereumClient` also offers Ethereum-specific methods not in the common trait:

```rust
// Cast to specific client type to access chain-specific methods
let eth_client = client as &EthereumClient;

// Get gas price
let gas_price = eth_client.get_gas_price()?;
println!("Current gas price: {} Gwei", gas_price);

// Estimate gas for a transaction
let gas_estimate = eth_client.estimate_gas(&transaction)?;
println!("Estimated gas: {}", gas_estimate);

// Call a contract view function
let data = eth_client.call_contract(
    &contract_address,
    "balanceOf(address)",
    &[ethers::abi::Token::Address(user_address)]
)?;
```

### Solana Client

The `SolanaClient` provides Solana-specific functionality:

```rust
use bedrock_blockchain::{solana::SolanaClient, common::BlockchainClient};

// Create client
let client = SolanaClient::new(
    "https://api.mainnet-beta.solana.com",
    "mainnet",
)?;

// Get current block (slot)
let slot = client.get_block_number()?;
println!("Current slot: {}", slot);

// Get SOL balance
let balance = client.get_balance(&address)?;
println!("SOL balance: {}", balance);
```

#### Solana-Specific Methods

```rust
// Cast to specific client type
let sol_client = client as &SolanaClient;

// Get account info
let account_info = sol_client.get_account_info(&address)?;

// Get token balance (SPL)
let token_balance = sol_client.get_token_balance(
    &token_account,
    &mint_address
)?;
```

## Advanced Usage

### Processing Multiple Blockchain Events

The library enables efficient processing of events from multiple blockchains simultaneously:

```rust
use bedrock_blockchain::{ethereum::EthereumClient, solana::SolanaClient};
use std::sync::{Arc, Mutex};
use std::thread;

// Create thread-safe client instances
let eth_client = Arc::new(Mutex::new(EthereumClient::new("https://ethereum-rpc", "mainnet", 1)?));
let sol_client = Arc::new(Mutex::new(SolanaClient::new("https://solana-rpc", "mainnet")?));

// Clone references for thread
let eth_client_clone = eth_client.clone();
let sol_client_clone = sol_client.clone();

// Process Ethereum events in a separate thread
let eth_thread = thread::spawn(move || {
    let client = eth_client_clone.lock().unwrap();
    // Process Ethereum blocks and events
});

// Process Solana events in a separate thread
let sol_thread = thread::spawn(move || {
    let client = sol_client_clone.lock().unwrap();
    // Process Solana slots and events
});

// Wait for both threads to complete
eth_thread.join().unwrap();
sol_thread.join().unwrap();
```

### Transaction Builders

For more complex transactions, use the chain-specific transaction builders:

```rust
use bedrock_blockchain::ethereum::TransactionBuilder;

let tx_builder = TransactionBuilder::new()
    .with_from("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
    .with_to("0x1f9840a85d5af5bf1d1762f925bdaddc4201f984")
    .with_value("1000000000000000000") // 1 ETH
    .with_gas_limit(21000)
    .with_data(vec![]);

// Build the transaction
let transaction = tx_builder.build()?;

// Send it
let tx_hash = client.send_transaction(&transaction)?;
```

## Performance Optimization

### Connection Pooling

For high-throughput applications, use connection pooling:

```rust
use bedrock_blockchain::ethereum::{EthereumClient, ConnectionPool};

// Create a connection pool with 5 connections
let pool = ConnectionPool::new(
    "https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
    "mainnet",
    1,
    5
)?;

// Get a client from the pool
let client = pool.get_client()?;

// Use the client
let balance = client.get_balance(&address)?;

// Return to pool happens automatically when client is dropped
```

### Batch Requests

Batch multiple requests for better performance:

```rust
use bedrock_blockchain::ethereum::BatchRequest;

// Create a batch request
let mut batch = client.create_batch_request();

// Add multiple operations
batch.add_balance_request(&address1);
batch.add_balance_request(&address2);
batch.add_block_number_request();

// Execute all at once
let results = batch.execute()?;

// Extract results
let balance1 = results.get_balance_result(0)?;
let balance2 = results.get_balance_result(1)?;
let block = results.get_block_number_result(2)?;
```

### Async/Await Support

For non-blocking I/O, use the async APIs:

```rust
use bedrock_blockchain::ethereum::AsyncEthereumClient;

#[tokio::main]
async fn main() -> Result<()> {
    // Create async client
    let client = AsyncEthereumClient::new(
        "https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
        "mainnet",
        1,
    ).await?;
    
    // Perform async operations
    let balance = client.get_balance(&address).await?;
    let block = client.get_block_number().await?;
    
    println!("Balance: {}, Block: {}", balance, block);
    
    Ok(())
}
```

## Error Handling

The library uses the `anyhow` crate for error handling, with specific error types for better diagnosis:

```rust
use bedrock_blockchain::errors::{BlockchainError, NetworkError, TransactionError};

fn process_transaction() -> Result<()> {
    let result = client.send_transaction(&transaction);
    
    match result {
        Ok(tx_hash) => println!("Transaction sent: {}", tx_hash),
        Err(e) => {
            // Convert anyhow error to specific type if possible
            if let Some(tx_err) = e.downcast_ref::<TransactionError>() {
                match tx_err {
                    TransactionError::InsufficientFunds => {
                        println!("Not enough funds to send transaction")
                    },
                    TransactionError::GasTooLow => {
                        println!("Gas price too low, increasing...")
                        // Retry with higher gas
                    },
                    _ => println!("Other transaction error: {}", tx_err),
                }
            } else if let Some(net_err) = e.downcast_ref::<NetworkError>() {
                println!("Network error: {}", net_err);
            } else {
                println!("Unknown error: {}", e);
            }
        }
    }
    
    Ok(())
}
```

## Testing and Mocking

The library provides mocking utilities for testing your applications:

```rust
use bedrock_blockchain::testing::{MockBlockchainClient, MockTransactionResponse};

#[test]
fn test_balance_check() {
    // Create a mock client
    let mut mock_client = MockBlockchainClient::new();
    
    // Set up expected behavior
    mock_client.expect_get_balance()
        .with(predicate::eq(Address::new("0x1234...")))
        .times(1)
        .returning(|_| Ok("1000000000000000000".to_string()));
    
    // Test your function with the mock
    let result = check_sufficient_balance(&mock_client, &Address::new("0x1234..."), "0.5");
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), true);
}
```

### Integration Testing

For integration testing with live networks, use the test networks:

```rust
fn test_with_testnet() -> Result<()> {
    // Connect to Sepolia testnet
    let client = EthereumClient::new(
        "https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY",
        "sepolia",
        11155111,
    )?;
    
    // Perform tests with real network but test ETH
    // ...
    
    Ok(())
}
```

## Extension and Customization

### Implementing Support for a New Blockchain

To add support for a new blockchain, implement the `BlockchainClient` trait:

```rust
use bedrock_blockchain::common::{BlockchainClient, Address, Transaction, TransactionStatus};
use anyhow::Result;

pub struct MyNewBlockchainClient {
    // Client-specific fields
}

impl BlockchainClient for MyNewBlockchainClient {
    fn get_balance(&self, address: &Address) -> Result<String> {
        // Implementation for the new blockchain
        // ...
    }
    
    fn send_transaction(&self, transaction: &Transaction) -> Result<String> {
        // Implementation
        // ...
    }
    
    // Implement other required methods
    // ...
}
```

### Custom Utilities

Create custom utilities that work with the common interfaces:

```rust
pub fn transfer_between_chains(
    from_client: &impl BlockchainClient,
    to_client: &impl BlockchainClient,
    from_address: &Address,
    to_address: &Address,
    bridge_contract: &Address,
    amount: &str,
) -> Result<String> {
    // Implementation for cross-chain transfers
    // ...
}
```

## Conclusion

The Bedrock Rust blockchain library provides a powerful, flexible interface for blockchain development. By abstracting away blockchain-specific details while still providing access to chain-specific features, it enables efficient cross-chain application development.

For more specific examples and detailed API documentation, refer to the API reference or check the example applications in the repository.