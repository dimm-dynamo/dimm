use anchor_lang::prelude::*;

/// Detailed statistics for an agent
#[account]
pub struct AgentStats {
    /// Agent account this belongs to
    pub agent: Pubkey,
    
    /// Total successful transactions
    pub successful_transactions: u64,
    
    /// Total failed transactions
    pub failed_transactions: u64,
    
    /// Total SOL spent on transfers
    pub sol_spent_transfers: u64,
    
    /// Total SOL spent on swaps
    pub sol_spent_swaps: u64,
    
    /// Total SOL spent on NFT operations
    pub sol_spent_nfts: u64,
    
    /// Total SOL spent on staking
    pub sol_spent_staking: u64,
    
    /// Total SOL spent on governance
    pub sol_spent_governance: u64,
    
    /// Total SOL spent on DeFi
    pub sol_spent_defi: u64,
    
    /// Average transaction size (in lamports)
    pub avg_transaction_size: u64,
    
    /// Largest single transaction (in lamports)
    pub largest_transaction: u64,
    
    /// Number of times daily limit was hit
    pub daily_limit_hits: u32,
    
    /// Number of times transaction limit was hit
    pub tx_limit_hits: u32,
    
    /// Total gas fees paid
    pub total_gas_paid: u64,
    
    /// Last activity timestamp
    pub last_activity: i64,
    
    /// Longest inactive period (in seconds)
    pub longest_inactive_period: i64,
    
    /// Total unique destinations interacted with
    pub unique_destinations: u32,
    
    /// Bump seed for PDA
    pub bump: u8,
    
    /// Reserved space
    pub reserved: [u8; 64],
}

impl AgentStats {
    pub const LEN: usize = 8 + // discriminator
        32 + // agent
        8 +  // successful_transactions
        8 +  // failed_transactions
        8 +  // sol_spent_transfers
        8 +  // sol_spent_swaps
        8 +  // sol_spent_nfts
        8 +  // sol_spent_staking
        8 +  // sol_spent_governance
        8 +  // sol_spent_defi
        8 +  // avg_transaction_size
        8 +  // largest_transaction
        4 +  // daily_limit_hits
        4 +  // tx_limit_hits
        8 +  // total_gas_paid
        8 +  // last_activity
        8 +  // longest_inactive_period
        4 +  // unique_destinations
        1 +  // bump
        64;  // reserved

    /// Update stats after a transaction
    pub fn record_transaction(
        &mut self,
        amount: u64,
        success: bool,
        activity_type: &crate::state::ActivityType,
    ) -> Result<()> {
        if success {
            self.successful_transactions = self.successful_transactions
                .checked_add(1)
                .ok_or(crate::errors::DimmError::NumericalOverflow)?;
                
            // Update category-specific spending
            match activity_type {
                crate::state::ActivityType::Transfer => {
                    self.sol_spent_transfers = self.sol_spent_transfers
                        .checked_add(amount)
                        .ok_or(crate::errors::DimmError::NumericalOverflow)?;
                }
                crate::state::ActivityType::Swap => {
                    self.sol_spent_swaps = self.sol_spent_swaps
                        .checked_add(amount)
                        .ok_or(crate::errors::DimmError::NumericalOverflow)?;
                }
                crate::state::ActivityType::NftOperation => {
                    self.sol_spent_nfts = self.sol_spent_nfts
                        .checked_add(amount)
                        .ok_or(crate::errors::DimmError::NumericalOverflow)?;
                }
                crate::state::ActivityType::Staking => {
                    self.sol_spent_staking = self.sol_spent_staking
                        .checked_add(amount)
                        .ok_or(crate::errors::DimmError::NumericalOverflow)?;
                }
                crate::state::ActivityType::Governance => {
                    self.sol_spent_governance = self.sol_spent_governance
                        .checked_add(amount)
                        .ok_or(crate::errors::DimmError::NumericalOverflow)?;
                }
                crate::state::ActivityType::DefiInteraction => {
                    self.sol_spent_defi = self.sol_spent_defi
                        .checked_add(amount)
                        .ok_or(crate::errors::DimmError::NumericalOverflow)?;
                }
                _ => {}
            }
            
            // Update largest transaction
            if amount > self.largest_transaction {
                self.largest_transaction = amount;
            }
            
            // Update average
            let total_tx = self.successful_transactions;
            if total_tx > 0 {
                let total_spent = self.sol_spent_transfers
                    .checked_add(self.sol_spent_swaps)
                    .and_then(|v| v.checked_add(self.sol_spent_nfts))
                    .and_then(|v| v.checked_add(self.sol_spent_staking))
                    .and_then(|v| v.checked_add(self.sol_spent_governance))
                    .and_then(|v| v.checked_add(self.sol_spent_defi))
                    .ok_or(crate::errors::DimmError::NumericalOverflow)?;
                    
                self.avg_transaction_size = total_spent / total_tx;
            }
        } else {
            self.failed_transactions = self.failed_transactions
                .checked_add(1)
                .ok_or(crate::errors::DimmError::NumericalOverflow)?;
        }
        
        Ok(())
    }
}

