// Bedrock Blockchain Library
// Main module structure for Rust blockchain components

pub mod ethereum;
pub mod solana;
pub mod common;
pub mod utils;

// Re-export primary components
pub use ethereum::EthereumClient;
pub use solana::SolanaClient;
pub use common::BlockchainClient;

/// Library version
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

/// Initialize the library with default logging
pub fn init() -> Result<(), Box<dyn std::error::Error>> {
    env_logger::init();
    dotenv::dotenv().ok();
    Ok(())
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
