use ethers::types::{Block, Transaction as EthTransaction, TransactionReceipt};
use serde::{Serialize, Deserialize};
use crate::common::{Address, Transaction};

/// Ethereum-specific configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EthereumConfig {
    pub rpc_url: String,
    pub chain_id: u64,
    pub network_name: String,
    pub block_explorer_url: Option<String>,
    pub gas_price_multiplier: f64,
}

impl Default for EthereumConfig {
    fn default() -> Self {
        Self {
            rpc_url: "http://localhost:8545".to_string(),
            chain_id: 1,  // Mainnet
            network_name: "mainnet".to_string(),
            block_explorer_url: Some("https://etherscan.io".to_string()),
            gas_price_multiplier: 1.0,
        }
    }
}

/// Helper functions for Ethereum transaction conversion
pub trait EthereumTransactionExt {
    fn to_common(&self) -> Transaction;
}

impl EthereumTransactionExt for EthTransaction {
    fn to_common(&self) -> Transaction {
        Transaction {
            hash: format!("{:?}", self.hash),
            from: self.from.map(|addr| Address::new(&format!("{:?}", addr))),
            to: self.to.map(|addr| Address::new(&format!("{:?}", addr))),
            value: self.value.to_string(),
            data: self.input.0.clone(),
            chain_id: self.chain_id.map(|id| id.as_u64()),
        }
    }
}

/// Ethereum network
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EthereumNetwork {
    Mainnet,
    Sepolia,
    Goerli,
    Local,
    Custom(u64),
}

impl EthereumNetwork {
    pub fn chain_id(&self) -> u64 {
        match self {
            Self::Mainnet => 1,
            Self::Sepolia => 11155111,
            Self::Goerli => 5,
            Self::Local => 31337,
            Self::Custom(id) => *id,
        }
    }
    
    pub fn from_chain_id(chain_id: u64) -> Self {
        match chain_id {
            1 => Self::Mainnet,
            11155111 => Self::Sepolia,
            5 => Self::Goerli,
            31337 => Self::Local,
            id => Self::Custom(id),
        }
    }
    
    pub fn name(&self) -> &'static str {
        match self {
            Self::Mainnet => "mainnet",
            Self::Sepolia => "sepolia",
            Self::Goerli => "goerli",
            Self::Local => "localhost",
            Self::Custom(_) => "custom",
        }
    }
}