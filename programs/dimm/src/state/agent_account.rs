use anchor_lang::prelude::*;
use crate::constants::*;

/// Agent SubAccount state
#[account]
pub struct AgentAccount {
    /// Main wallet that owns this agent
    pub main_wallet: Pubkey,
    
    /// Agent identifier (unique per main wallet)
    pub agent_id: u64,
    
    /// Agent name
    pub name: String,
    
    /// Current permissions granted to this agent
    pub permissions: Vec<AgentPermission>,
    
    /// Maximum SOL per transaction (in lamports)
    pub max_sol_per_transaction: u64,
    
    /// Daily limit (in lamports)
    pub daily_limit: u64,
    
    /// Total SOL spent today (in lamports)
    pub spent_today: u64,
    
    /// Timestamp of last daily reset
    pub last_daily_reset: i64,
    
    /// Total SOL spent all time (in lamports)
    pub total_spent: u64,
    
    /// Total transactions executed
    pub total_transactions: u64,
    
    /// Whether this agent is revoked
    pub revoked: bool,
    
    /// Timestamp when agent was created
    pub created_at: i64,
    
    /// Timestamp when agent was last used
    pub last_used_at: i64,
    
    /// Merkle tree leaf index for cNFT
    pub leaf_index: u32,
    
    /// Bump seed for PDA
    pub bump: u8,
    
    /// Reserved space for future upgrades
    pub reserved: [u8; 128],
}

impl AgentAccount {
    pub const LEN: usize = 8 + // discriminator
        32 + // main_wallet
        8 +  // agent_id
        4 + MAX_AGENT_NAME_LENGTH + // name (String with length prefix)
        4 + (1 * 20) + // permissions (Vec with max 20 permissions)
        8 +  // max_sol_per_transaction
        8 +  // daily_limit
        8 +  // spent_today
        8 +  // last_daily_reset
        8 +  // total_spent
        8 +  // total_transactions
        1 +  // revoked
        8 +  // created_at
        8 +  // last_used_at
        4 +  // leaf_index
        1 +  // bump
        128; // reserved

    /// Check if daily limit needs to be reset
    pub fn check_and_reset_daily_limit(&mut self, current_time: i64) -> Result<()> {
        let time_since_reset = current_time
            .checked_sub(self.last_daily_reset)
            .ok_or(crate::errors::DimmError::InvalidActivityWindow)?;

        if time_since_reset >= DAILY_WINDOW_SECONDS {
            self.spent_today = 0;
            self.last_daily_reset = current_time;
        }
        
        Ok(())
    }

    /// Check if agent can spend the specified amount
    pub fn can_spend(&self, amount: u64) -> Result<bool> {
        // Check per-transaction limit
        if amount > self.max_sol_per_transaction {
            return Ok(false);
        }

        // Check daily limit
        let new_daily_total = self.spent_today
            .checked_add(amount)
            .ok_or(crate::errors::DimmError::NumericalOverflow)?;
            
        if new_daily_total > self.daily_limit {
            return Ok(false);
        }

        Ok(true)
    }

    /// Record a spend
    pub fn record_spend(&mut self, amount: u64) -> Result<()> {
        self.spent_today = self.spent_today
            .checked_add(amount)
            .ok_or(crate::errors::DimmError::NumericalOverflow)?;
            
        self.total_spent = self.total_spent
            .checked_add(amount)
            .ok_or(crate::errors::DimmError::NumericalOverflow)?;
            
        self.total_transactions = self.total_transactions
            .checked_add(1)
            .ok_or(crate::errors::DimmError::NumericalOverflow)?;
            
        Ok(())
    }

    /// Check if agent has a specific permission
    pub fn has_permission(&self, permission: &AgentPermission) -> bool {
        self.permissions.contains(permission)
    }
}

/// Permission types for agents
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum AgentPermission {
    /// Transfer SOL to any address
    TransferSol,
    
    /// Swap tokens on DEXs
    SwapTokens,
    
    /// Interact with NFT marketplaces
    NftOperations,
    
    /// Stake SOL or tokens
    Staking,
    
    /// Participate in DAO governance
    Governance,
    
    /// Interact with DeFi protocols
    DefiProtocols,
    
    /// Create and manage token accounts
    TokenAccounts,
    
    /// Execute arbitrary programs (use with caution)
    ExecutePrograms,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct CreateAgentParams {
    /// Agent name
    pub name: String,
    
    /// Initial permissions
    pub permissions: Vec<AgentPermission>,
    
    /// Max SOL per transaction
    pub max_sol_per_transaction: u64,
    
    /// Daily limit
    pub daily_limit: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct UpdateLimitsParams {
    /// New max SOL per transaction
    pub max_sol_per_transaction: Option<u64>,
    
    /// New daily limit
    pub daily_limit: Option<u64>,
}


