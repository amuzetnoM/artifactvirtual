// Encoding utilities for blockchain data
use anyhow::{Result, anyhow};
use hex;
use std::str;

/// Encode bytes as a hexadecimal string with 0x prefix
pub fn to_hex_string(bytes: &[u8]) -> String {
    format!("0x{}", hex::encode(bytes))
}

/// Decode a hex string (with or without 0x prefix) to bytes
pub fn from_hex_string(hex_str: &str) -> Result<Vec<u8>> {
    let cleaned_hex = hex_str.trim_start_matches("0x");
    hex::decode(cleaned_hex)
        .map_err(|e| anyhow!("Invalid hex string: {}", e))
}

/// Base58 encoding (used by Bitcoin, Solana, etc.)
pub fn to_base58(bytes: &[u8]) -> String {
    bs58::encode(bytes).into_string()
}

/// Base58 decoding
pub fn from_base58(s: &str) -> Result<Vec<u8>> {
    bs58::decode(s).into_vec()
        .map_err(|e| anyhow!("Invalid base58 string: {}", e))
}

/// Base64 encoding
pub fn to_base64(bytes: &[u8]) -> String {
    base64::encode(bytes)
}

/// Base64 decoding
pub fn from_base64(s: &str) -> Result<Vec<u8>> {
    base64::decode(s)
        .map_err(|e| anyhow!("Invalid base64 string: {}", e))
}

/// Encode an integer as big-endian bytes
pub fn encode_int_be(value: u64, bytes_len: usize) -> Vec<u8> {
    let mut result = vec![0u8; bytes_len];
    for i in 0..bytes_len {
        result[bytes_len - 1 - i] = ((value >> (i * 8)) & 0xff) as u8;
    }
    result
}

/// Decode a big-endian byte array to an integer
pub fn decode_int_be(bytes: &[u8]) -> u64 {
    let mut result = 0u64;
    for &b in bytes {
        result = (result << 8) | b as u64;
    }
    result
}

/// Encode an integer as little-endian bytes
pub fn encode_int_le(value: u64, bytes_len: usize) -> Vec<u8> {
    let mut result = vec![0u8; bytes_len];
    for i in 0..bytes_len {
        result[i] = ((value >> (i * 8)) & 0xff) as u8;
    }
    result
}

/// Decode a little-endian byte array to an integer
pub fn decode_int_le(bytes: &[u8]) -> u64 {
    let mut result = 0u64;
    for (i, &b) in bytes.iter().enumerate() {
        result |= (b as u64) << (i * 8);
    }
    result
}

/// UTF-8 encode a string to bytes
pub fn utf8_encode(s: &str) -> Vec<u8> {
    s.as_bytes().to_vec()
}

/// UTF-8 decode bytes to a string
pub fn utf8_decode(bytes: &[u8]) -> Result<String> {
    str::from_utf8(bytes)
        .map(|s| s.to_string())
        .map_err(|e| anyhow!("Invalid UTF-8 sequence: {}", e))
}