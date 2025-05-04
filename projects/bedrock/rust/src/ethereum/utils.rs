use std::str::FromStr;
use anyhow::{Result, anyhow};
use ethers::types::{Address as EthAddress, U256};
use ethers::utils::{parse_ether, format_ether};

use crate::common::Address;

/// Convert a string to an Ethereum address
pub fn parse_eth_address(address: &str) -> Result<EthAddress> {
    EthAddress::from_str(address)
        .map_err(|e| anyhow!("Invalid Ethereum address: {}", e))
}

/// Convert a common address to an Ethereum address
pub fn to_eth_address(address: &Address) -> Result<EthAddress> {
    parse_eth_address(address.as_str())
}

/// Convert a common address from an Ethereum address
pub fn from_eth_address(address: &EthAddress) -> Address {
    Address::new(&format!("{:?}", address))
}

/// Parse an ETH amount from a string (e.g. "1.5" -> 1.5 ETH in wei)
pub fn parse_eth_amount(amount: &str) -> Result<U256> {
    parse_ether(amount)
        .map_err(|e| anyhow!("Invalid ETH amount: {}", e))
}

/// Format an ETH amount as a string (e.g. 1500000000000000000 -> "1.5")
pub fn format_eth_amount(amount: U256) -> String {
    format_ether(amount)
}

/// Calculate gas cost for a transaction
pub fn calculate_gas_cost(gas_limit: U256, gas_price: U256) -> U256 {
    gas_limit * gas_price
}

/// Generate a random private key for testing
pub fn generate_random_private_key() -> String {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    let key: [u8; 32] = rng.gen();
    
    format!("0x{}", hex::encode(key))
}