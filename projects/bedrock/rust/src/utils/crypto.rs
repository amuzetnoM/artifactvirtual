// Cryptographic utilities for blockchain operations
use anyhow::{Result, anyhow};
use sha2::{Sha256, Digest};
use sha3::Keccak256;
use rand::{Rng, thread_rng};
use hex;

/// Calculate SHA-256 hash of data
pub fn sha256_hash(data: &[u8]) -> Vec<u8> {
    let mut hasher = Sha256::new();
    hasher.update(data);
    hasher.finalize().to_vec()
}

/// Calculate SHA-256 hash and return as hex string
pub fn sha256_hex(data: &[u8]) -> String {
    let hash = sha256_hash(data);
    hex::encode(hash)
}

/// Calculate Keccak-256 hash (used by Ethereum)
pub fn keccak256_hash(data: &[u8]) -> Vec<u8> {
    let mut hasher = Keccak256::new();
    hasher.update(data);
    hasher.finalize().to_vec()
}

/// Calculate Keccak-256 hash and return as hex string
pub fn keccak256_hex(data: &[u8]) -> String {
    let hash = keccak256_hash(data);
    hex::encode(hash)
}

/// Generate random bytes of specified length
pub fn random_bytes(length: usize) -> Vec<u8> {
    let mut rng = thread_rng();
    let mut bytes = vec![0u8; length];
    rng.fill(&mut bytes[..]);
    bytes
}

/// Generates an Ethereum-style address from a public key
pub fn ethereum_address_from_pubkey(pubkey: &[u8]) -> String {
    // Remove the first byte (0x04 which indicates uncompressed key)
    let pubkey_without_prefix = if pubkey[0] == 4 && pubkey.len() == 65 {
        &pubkey[1..]
    } else {
        pubkey
    };
    
    // Hash the public key with Keccak-256
    let hash = keccak256_hash(pubkey_without_prefix);
    
    // Take the last 20 bytes and format as hex with 0x prefix
    format!("0x{}", hex::encode(&hash[hash.len() - 20..]))
}

/// Verify an ECDSA signature for Ethereum
pub fn verify_ecdsa_signature(
    message_hash: &[u8],
    signature: &[u8],
    public_key: &[u8],
) -> Result<bool> {
    // Placeholder for actual ECDSA verification
    // In a real implementation, this would use the k256 crate to verify the signature
    Ok(true)
}

/// Simple one-time pad encryption (for educational purposes only)
pub fn xor_encrypt(data: &[u8], key: &[u8]) -> Vec<u8> {
    data.iter()
        .zip(key.iter().cycle())
        .map(|(d, k)| d ^ k)
        .collect()
}

/// Generate a mnemonic phrase (BIP-39)
pub fn generate_mnemonic() -> String {
    // Placeholder for BIP-39 mnemonic generation
    // In a real implementation, this would use a BIP-39 library
    "abandon ability able about above absent absorb abstract absurd abuse access accident".to_string()
}