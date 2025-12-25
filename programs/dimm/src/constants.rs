use anchor_lang::prelude::*;

#[constant]
pub const PROTOCOL_SEED: &[u8] = b"dimm_protocol";

#[constant]
pub const AGENT_SEED: &[u8] = b"dimm_agent";

#[constant]
pub const ACTIVITY_SEED: &[u8] = b"dimm_activity";

#[constant]
pub const TREE_AUTHORITY_SEED: &[u8] = b"tree_authority";

/// Maximum number of agents per main wallet
pub const MAX_AGENTS_PER_WALLET: u16 = 10000;

/// Maximum transaction size for agent operations
pub const MAX_TRANSACTION_SIZE: usize = 1232;

/// Maximum length for agent names
pub const MAX_AGENT_NAME_LENGTH: usize = 32;

/// Maximum length for activity reasons
pub const MAX_REASON_LENGTH: usize = 128;

/// Minimum SOL balance to keep in agent account (rent exempt + buffer)
pub const MIN_AGENT_BALANCE: u64 = 5_000_000; // 0.005 SOL

/// Default daily limit for new agents (in lamports)
pub const DEFAULT_DAILY_LIMIT: u64 = 1_000_000_000; // 1 SOL

/// Default per-transaction limit (in lamports)
pub const DEFAULT_TX_LIMIT: u64 = 100_000_000; // 0.1 SOL

/// Time window for daily limits (in seconds)
pub const DAILY_WINDOW_SECONDS: i64 = 86400; // 24 hours

