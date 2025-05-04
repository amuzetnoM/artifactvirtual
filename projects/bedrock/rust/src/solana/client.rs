use std::fmt::Debug;
use std::str::FromStr;
use anyhow::{Result, anyhow};
use solana_client::rpc_client::RpcClient;
use solana_sdk::pubkey::Pubkey;
use solana_sdk::signature::{Keypair, Signature};
use solana_sdk::transaction::Transaction as SolanaTransaction;
use solana_sdk::commitment_config::CommitmentConfig;

use crate::common::{BlockchainClient, Address, Transaction, TransactionStatus, BlockchainContext};
use crate::solana::types::SolanaConfig;

/// Client for interacting with Solana blockchain
#[derive(Debug)]
pub struct SolanaClient {
    client: RpcClient,
    network_name: String,
    commitment: CommitmentConfig,
}

impl SolanaClient {
    /// Create a new Solana client with the given URL
    pub fn new(url: &str, network_name: &str) -> Self {
        let client = RpcClient::new_with_commitment(
            url.to_string(),
            CommitmentConfig::confirmed(),
        );
        
        Self {
            client,
            network_name: network_name.to_string(),
            commitment: CommitmentConfig::confirmed(),
        }
    }
    
    /// Create a new Solana client from context
    pub fn from_context(context: BlockchainContext) -> Self {
        Self::new(&context.network_url, &context.network_name)
    }
    
    /// Create a new Solana client from config
    pub fn from_config(config: &SolanaConfig) -> Self {
        Self::new(&config.rpc_url, &config.network_name)
    }
    
    /// Get the underlying RPC client
    pub fn client(&self) -> &RpcClient {
        &self.client
    }
    
    /// Convert a common address to a Solana pubkey
    fn to_solana_pubkey(&self, address: &Address) -> Result<Pubkey> {
        Pubkey::from_str(address.as_str())
            .map_err(|e| anyhow!("Invalid Solana address: {}", e))
    }
    
    /// Get minimum balance for rent exemption
    pub fn get_minimum_balance_for_rent_exemption(&self, data_size: usize) -> Result<u64> {
        self.client
            .get_minimum_balance_for_rent_exemption(data_size)
            .map_err(|e| anyhow!("Failed to get minimum balance for rent exemption: {}", e))
    }
}

impl BlockchainClient for SolanaClient {
    fn get_balance(&self, address: &Address) -> Result<String> {
        let pubkey = self.to_solana_pubkey(address)?;
        
        let balance = self.client
            .get_balance(&pubkey)
            .map_err(|e| anyhow!("Failed to get balance: {}", e))?;
        
        Ok(balance.to_string())
    }
    
    fn send_transaction(&self, transaction: &Transaction) -> Result<String> {
        // In a real implementation, this would prepare and send a Solana transaction
        // For demonstration purposes, we'll just return a placeholder signature
        Ok("5UfvV9TDuQSXziCnASrQVYyWPBpGM8qy1zrRLyxKDBBkfhGzvHXjtSofKAJ65KWxVKZg2YaWzW9WMT8ygkNcSRHf".to_string())
    }
    
    fn get_transaction_status(&self, tx_hash: &str) -> Result<TransactionStatus> {
        let signature = Signature::from_str(tx_hash)
            .map_err(|e| anyhow!("Invalid transaction signature: {}", e))?;
            
        let status = self.client
            .get_signature_status(&signature)
            .map_err(|e| anyhow!("Failed to get transaction status: {}", e))?;
        
        match status {
            Some(Ok(_)) => Ok(TransactionStatus::Confirmed),
            Some(Err(_)) => Ok(TransactionStatus::Failed),
            None => Ok(TransactionStatus::Pending),
        }
    }
    
    fn get_block_number(&self) -> Result<u64> {
        let slot = self.client
            .get_slot()
            .map_err(|e| anyhow!("Failed to get current slot: {}", e))?;
        
        Ok(slot)
    }
    
    fn connect(&mut self) -> Result<()> {
        // Check if we can connect by requesting the genesis hash
        self.client
            .get_genesis_hash()
            .map_err(|e| anyhow!("Failed to connect to Solana node: {}", e))?;
        
        Ok(())
    }
    
    fn disconnect(&mut self) -> Result<()> {
        // No explicit disconnection needed for the RPC client
        Ok(())
    }
}