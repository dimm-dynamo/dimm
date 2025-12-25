use anchor_lang::prelude::*;
use crate::constants::*;

/// Agent activity log
#[account]
pub struct AgentActivity {
    /// Agent account this activity belongs to
    pub agent: Pubkey,
    
    /// Activity type
    pub activity_type: ActivityType,
    
    /// Amount involved (in lamports)
    pub amount: u64,
    
    /// Destination (if applicable)
    pub destination: Option<Pubkey>,
    
    /// Reason/description
    pub reason: String,
    
    /// Timestamp
    pub timestamp: i64,
    
    /// Transaction signature
    pub signature: [u8; 64],
    
    /// Whether the activity was successful
    pub success: bool,
    
    /// Bump seed for PDA
    pub bump: u8,
}

impl AgentActivity {
    pub const LEN: usize = 8 + // discriminator
        32 + // agent
        1 +  // activity_type (enum)
        8 +  // amount
        1 + 32 + // destination (Option<Pubkey>)
        4 + MAX_REASON_LENGTH + // reason
        8 +  // timestamp
        64 + // signature
        1 +  // success
        1;   // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum ActivityType {
    /// SOL transfer
    Transfer,
    
    /// Token swap
    Swap,
    
    /// NFT operation
    NftOperation,
    
    /// Staking operation
    Staking,
    
    /// Governance vote
    Governance,
    
    /// DeFi protocol interaction
    DefiInteraction,
    
    /// Agent funded from main wallet
    Funding,
    
    /// Withdrawal to main wallet
    Withdrawal,
    
    /// Other operation
    Other,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct ActivityParams {
    /// Activity type
    pub activity_type: ActivityType,
    
    /// Amount
    pub amount: u64,
    
    /// Destination
    pub destination: Option<Pubkey>,
    
    /// Reason
    pub reason: String,
    
    /// Transaction signature
    pub signature: [u8; 64],
    
    /// Success status
    pub success: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct ExecuteTransactionParams {
    /// Type of transaction
    pub activity_type: ActivityType,
    
    /// Amount (if applicable)
    pub amount: u64,
    
    /// Destination (if applicable)
    pub destination: Option<Pubkey>,
    
    /// Additional instruction data
    pub instruction_data: Vec<u8>,
}


