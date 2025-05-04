use serde::{Serialize, Deserialize};
use solana_sdk::transaction::Transaction as SolanaTransaction;
use solana_sdk::signature::Signature;
use solana_sdk::commitment_config::CommitmentLevel;
use crate::common::{Address, Transaction};

/// Solana configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SolanaConfig {
    pub rpc_url: String,
    pub network_name: String,
    pub commitment: String,
    pub block_explorer_url: Option<String>,
}

impl Default for SolanaConfig {
    fn default() -> Self {
        Self {
            rpc_url: "https://api.devnet.solana.com".to_string(),
            network_name: "devnet".to_string(),
            commitment: "confirmed".to_string(),
            block_explorer_url: Some("https://explorer.solana.com".to_string()),
        }
    }
}

/// Solana network type
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SolanaNetwork {
    Mainnet,
    Devnet,
    Testnet,
    Localnet,
    Custom,
}

impl SolanaNetwork {
    /// Get the default RPC URL for this network
    pub fn rpc_url(&self) -> &'static str {
        match self {
            Self::Mainnet => "https://api.mainnet-beta.solana.com",
            Self::Devnet => "https://api.devnet.solana.com",
            Self::Testnet => "https://api.testnet.solana.com",
            Self::Localnet => "http://localhost:8899",
            Self::Custom => "",
        }
    }
    
    /// Get the network name
    pub fn name(&self) -> &'static str {
        match self {
            Self::Mainnet => "mainnet-beta",
            Self::Devnet => "devnet",
            Self::Testnet => "testnet",
            Self::Localnet => "localnet",
            Self::Custom => "custom",
        }
    }
    
    /// Get the network from name
    pub fn from_name(name: &str) -> Self {
        match name.to_lowercase().as_str() {
            "mainnet" | "mainnet-beta" => Self::Mainnet,
            "devnet" => Self::Devnet,
            "testnet" => Self::Testnet,
            "localnet" | "localhost" => Self::Localnet,
            _ => Self::Custom,
        }
    }
}

/// Helper trait for Solana transaction conversion
pub trait SolanaTransactionExt {
    fn to_common(&self, signature: &Signature) -> Transaction;
}

impl SolanaTransactionExt for SolanaTransaction {
    fn to_common(&self, signature: &Signature) -> Transaction {
        // In a real implementation, we would extract more information
        Transaction {
            hash: signature.to_string(),
            from: Some(Address::new(&self.message.account_keys[0].to_string())),
            to: Some(Address::new(&self.message.account_keys[1].to_string())),
            value: "0".to_string(),
            data: vec![],
            chain_id: None,
        }
    }
}