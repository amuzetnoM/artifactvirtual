// Logging utilities for blockchain operations
use log::{info, warn, error, debug, trace, LevelFilter};
use std::sync::Once;

static INIT: Once = Once::new();

/// Initialize the logger with the specified log level
pub fn init_logger(level: LevelFilter) {
    INIT.call_once(|| {
        env_logger::Builder::new()
            .filter_level(level)
            .format_timestamp_millis()
            .init();
            
        info!("Logger initialized with level: {:?}", level);
    });
}

/// Initialize the logger with default settings
pub fn init_default_logger() {
    init_logger(LevelFilter::Info);
}

/// Log a blockchain transaction
pub fn log_transaction(chain: &str, tx_hash: &str, from: Option<&str>, to: Option<&str>, value: &str) {
    info!(
        "[{}] Transaction: hash={}, from={}, to={}, value={}",
        chain,
        tx_hash,
        from.unwrap_or("unknown"),
        to.unwrap_or("unknown"),
        value
    );
}

/// Log a blockchain error with context
pub fn log_blockchain_error(chain: &str, operation: &str, error: &str) {
    error!("[{}] Error during {}: {}", chain, operation, error);
}

/// Log an RPC request for debugging
pub fn log_rpc_request(chain: &str, method: &str, params: &str) {
    debug!("[{}] RPC Request: method={}, params={}", chain, method, params);
}

/// Log an RPC response for debugging
pub fn log_rpc_response(chain: &str, method: &str, result: &str) {
    debug!("[{}] RPC Response: method={}, result={}", chain, method, result);
}

/// Log a network connection event
pub fn log_network_event(chain: &str, event_type: &str, details: &str) {
    info!("[{}] Network {}: {}", chain, event_type, details);
}

/// Performance logging for timing operations
pub struct Timer {
    start: std::time::Instant,
    operation: String,
    chain: String,
}

impl Timer {
    pub fn new(chain: &str, operation: &str) -> Self {
        let timer = Self {
            start: std::time::Instant::now(),
            operation: operation.to_string(),
            chain: chain.to_string(),
        };
        debug!("[{}] Starting operation: {}", chain, operation);
        timer
    }
}

impl Drop for Timer {
    fn drop(&mut self) {
        let elapsed = self.start.elapsed();
        debug!(
            "[{}] Operation '{}' completed in {:.2?}",
            self.chain, self.operation, elapsed
        );
    }
}