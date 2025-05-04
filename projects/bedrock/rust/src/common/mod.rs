// Common blockchain interfaces and traits
// These define blockchain-agnostic functionality

use std::fmt::Debug;
use anyhow::Result;
use serde::{Serialize, Deserialize};

/// Common representation of a blockchain address
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Address(pub String);

impl Address {
    pub fn new(value: &str) -> Self {
        Self(value.to_string())
    }
    
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

/// Generic blockchain transaction
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub hash: String,
    pub from: Option<Address>,
    pub to: Option<Address>,
    pub value: String,
    pub data: Vec<u8>,
    pub chain_id: Option<u64>,
}

/// Transaction status
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum TransactionStatus {
    Pending,
    Confirmed,
    Failed,
    Unknown,
}

/// Generic blockchain interface
pub trait BlockchainClient: Debug + Send + Sync {
    /// Get the balance for an address
    fn get_balance(&self, address: &Address) -> Result<String>;
    
    /// Send a transaction
    fn send_transaction(&self, transaction: &Transaction) -> Result<String>;
    
    /// Check transaction status
    fn get_transaction_status(&self, tx_hash: &str) -> Result<TransactionStatus>;
    
    /// Get the current block height/number
    fn get_block_number(&self) -> Result<u64>;
    
    /// Connect to the blockchain network
    fn connect(&mut self) -> Result<()>;
    
    /// Disconnect from the blockchain network
    fn disconnect(&mut self) -> Result<()>;
}

/// Context for blockchain operations
pub struct BlockchainContext {
    pub network_url: String,
    pub network_name: String,
    pub chain_id: Option<u64>,
}