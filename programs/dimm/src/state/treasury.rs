use anchor_lang::prelude::*;

/// Treasury account for protocol fees and funds
#[account]
pub struct Treasury {
    /// Protocol authority
    pub authority: Pubkey,
    
    /// Total fees collected
    pub total_fees_collected: u64,
    
    /// Total SOL distributed to agents
    pub total_distributed: u64,
    
    /// Total SOL withdrawn from agents
    pub total_withdrawn: u64,
    
    /// Number of active agents
    pub active_agents: u64,
    
    /// Protocol fee basis points (100 = 1%)
    pub fee_bps: u16,
    
    /// Minimum fee in lamports
    pub min_fee: u64,
    
    /// Last fee collection timestamp
    pub last_fee_collection: i64,
    
    /// Bump seed for PDA
    pub bump: u8,
    
    /// Reserved space
    pub reserved: [u8; 128],
}

impl Treasury {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        8 +  // total_fees_collected
        8 +  // total_distributed
        8 +  // total_withdrawn
        8 +  // active_agents
        2 +  // fee_bps
        8 +  // min_fee
        8 +  // last_fee_collection
        1 +  // bump
        128; // reserved

    /// Calculate fee for a given amount
    pub fn calculate_fee(&self, amount: u64) -> Result<u64> {
        let fee = (amount as u128)
            .checked_mul(self.fee_bps as u128)
            .and_then(|v| v.checked_div(10000))
            .and_then(|v| u64::try_from(v).ok())
            .ok_or(crate::errors::DimmError::NumericalOverflow)?;
            
        Ok(fee.max(self.min_fee))
    }
}

