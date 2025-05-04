use std::fmt::Debug;
use std::str::FromStr;
use anyhow::{Result, anyhow};
use ethers::prelude::*;
use ethers::utils::parse_ether;
use ethers::providers::{Http, Provider};

use crate::common::{BlockchainClient, Address, Transaction, TransactionStatus, BlockchainContext};

/// Client for interacting with Ethereum blockchain
#[derive(Debug)]
pub struct EthereumClient {
    provider: Provider<Http>,
    chain_id: u64,
    network_name: String,
}

impl EthereumClient {
    /// Create a new Ethereum client with the given URL and chain ID
    pub fn new(url: &str, network_name: &str, chain_id: u64) -> Result<Self> {
        let provider = Provider::<Http>::try_from(url)
            .map_err(|e| anyhow!("Failed to create Ethereum provider: {}", e))?;
        
        Ok(Self {
            provider,
            chain_id,
            network_name: network_name.to_string(),
        })
    }
    
    /// Create a new Ethereum client from context
    pub fn from_context(context: BlockchainContext) -> Result<Self> {
        let chain_id = context.chain_id.unwrap_or(1); // Default to mainnet
        Self::new(&context.network_url, &context.network_name, chain_id)
    }
    
    /// Get the underlying provider
    pub fn provider(&self) -> &Provider<Http> {
        &self.provider
    }
    
    /// Get the chain ID
    pub fn chain_id(&self) -> u64 {
        self.chain_id
    }
    
    /// Convert a common address to an Ethereum H160 address
    fn to_eth_address(&self, address: &Address) -> Result<H160> {
        H160::from_str(address.as_str())
            .map_err(|e| anyhow!("Invalid Ethereum address: {}", e))
    }
}

impl BlockchainClient for EthereumClient {
    fn get_balance(&self, address: &Address) -> Result<String> {
        let eth_address = self.to_eth_address(address)?;
        
        let balance = tokio_test::block_on(async {
            self.provider.get_balance(eth_address, None).await
        }).map_err(|e| anyhow!("Failed to get balance: {}", e))?;
        
        Ok(balance.to_string())
    }
    
    fn send_transaction(&self, transaction: &Transaction) -> Result<String> {
        // In a real implementation, this would sign and send the transaction
        // For demonstration purposes, we'll just return a placeholder hash
        Ok("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef".to_string())
    }
    
    fn get_transaction_status(&self, tx_hash: &str) -> Result<TransactionStatus> {
        let tx_hash = H256::from_str(tx_hash)
            .map_err(|e| anyhow!("Invalid transaction hash: {}", e))?;
            
        let receipt = tokio_test::block_on(async {
            self.provider.get_transaction_receipt(tx_hash).await
        }).map_err(|e| anyhow!("Failed to get transaction receipt: {}", e))?;
        
        match receipt {
            Some(r) => {
                if r.status == Some(U64::from(1)) {
                    Ok(TransactionStatus::Confirmed)
                } else {
                    Ok(TransactionStatus::Failed)
                }
            },
            None => Ok(TransactionStatus::Pending),
        }
    }
    
    fn get_block_number(&self) -> Result<u64> {
        let block_number = tokio_test::block_on(async {
            self.provider.get_block_number().await
        }).map_err(|e| anyhow!("Failed to get block number: {}", e))?;
        
        Ok(block_number.as_u64())
    }
    
    fn connect(&mut self) -> Result<()> {
        // For HTTP provider, there's no explicit connection step
        Ok(())
    }
    
    fn disconnect(&mut self) -> Result<()> {
        // For HTTP provider, there's no explicit disconnection step
        Ok(())
    }
}