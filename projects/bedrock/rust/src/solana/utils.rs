use std::str::FromStr;
use anyhow::{Result, anyhow};
use solana_sdk::pubkey::Pubkey;
use solana_sdk::signature::{Keypair, Signer};
use solana_sdk::commitment_config::{CommitmentConfig, CommitmentLevel};
use rand::rngs::OsRng;

use crate::common::Address;

/// Convert a string to a Solana pubkey
pub fn parse_solana_pubkey(address: &str) -> Result<Pubkey> {
    Pubkey::from_str(address)
        .map_err(|e| anyhow!("Invalid Solana pubkey: {}", e))
}

/// Convert a common address to a Solana pubkey
pub fn to_solana_pubkey(address: &Address) -> Result<Pubkey> {
    parse_solana_pubkey(address.as_str())
}

/// Convert a Solana pubkey to a common address
pub fn from_solana_pubkey(pubkey: &Pubkey) -> Address {
    Address::new(&pubkey.to_string())
}

/// Create a commitment config from a string level
pub fn commitment_from_str(level: &str) -> CommitmentConfig {
    match level.to_lowercase().as_str() {
        "processed" => CommitmentConfig::processed(),
        "confirmed" => CommitmentConfig::confirmed(),
        "finalized" => CommitmentConfig::finalized(),
        _ => CommitmentConfig::default(),
    }
}

/// Generate a new random keypair for testing
pub fn generate_keypair() -> Keypair {
    Keypair::generate(&mut OsRng)
}

/// Generate a random keypair and return as base58 string
pub fn generate_keypair_base58() -> String {
    let keypair = generate_keypair();
    bs58::encode(keypair.to_bytes()).into_string()
}

/// Load a keypair from a base58 string
pub fn keypair_from_base58(base58_str: &str) -> Result<Keypair> {
    let bytes = bs58::decode(base58_str)
        .into_vec()
        .map_err(|e| anyhow!("Invalid base58 string: {}", e))?;
        
    Keypair::from_bytes(&bytes)
        .map_err(|e| anyhow!("Invalid keypair bytes: {}", e))
}

/// Format lamports as SOL
pub fn lamports_to_sol(lamports: u64) -> f64 {
    lamports as f64 / 1_000_000_000.0
}

/// Convert SOL to lamports
pub fn sol_to_lamports(sol: f64) -> u64 {
    (sol * 1_000_000_000.0) as u64
}