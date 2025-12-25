use anchor_lang::prelude::*;

/// Delegation allows agents to delegate permissions to sub-agents
#[account]
pub struct Delegation {
    /// Parent agent
    pub parent_agent: Pubkey,
    
    /// Delegated agent (sub-agent)
    pub delegated_agent: Pubkey,
    
    /// Delegated permissions (subset of parent's permissions)
    pub delegated_permissions: Vec<crate::state::AgentPermission>,
    
    /// Maximum SOL the delegated agent can spend per transaction
    pub max_sol_per_transaction: u64,
    
    /// Daily limit for delegated agent
    pub daily_limit: u64,
    
    /// Expiration timestamp (0 = no expiration)
    pub expires_at: i64,
    
    /// Whether delegation is active
    pub active: bool,
    
    /// Created timestamp
    pub created_at: i64,
    
    /// Total spent by delegated agent
    pub total_spent: u64,
    
    /// Total transactions by delegated agent
    pub total_transactions: u64,
    
    /// Bump seed for PDA
    pub bump: u8,
    
    /// Reserved space
    pub reserved: [u8; 64],
}

impl Delegation {
    pub const LEN: usize = 8 + // discriminator
        32 + // parent_agent
        32 + // delegated_agent
        4 + (1 * 10) + // delegated_permissions (max 10)
        8 +  // max_sol_per_transaction
        8 +  // daily_limit
        8 +  // expires_at
        1 +  // active
        8 +  // created_at
        8 +  // total_spent
        8 +  // total_transactions
        1 +  // bump
        64;  // reserved

    /// Check if delegation is valid and not expired
    pub fn is_valid(&self, current_time: i64) -> bool {
        if !self.active {
            return false;
        }
        
        if self.expires_at > 0 && current_time >= self.expires_at {
            return false;
        }
        
        true
    }

    /// Check if delegated agent has a specific permission
    pub fn has_permission(&self, permission: &crate::state::AgentPermission) -> bool {
        self.delegated_permissions.contains(permission)
    }
}

