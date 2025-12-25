use anchor_lang::prelude::*;

/// Emergency pause state for the protocol
#[account]
pub struct EmergencyState {
    /// Protocol authority
    pub authority: Pubkey,
    
    /// Whether protocol is paused
    pub paused: bool,
    
    /// Reason for pause
    pub pause_reason: String,
    
    /// When the pause started
    pub paused_at: i64,
    
    /// Who initiated the pause
    pub paused_by: Pubkey,
    
    /// Emergency contacts (can unpause)
    pub emergency_contacts: Vec<Pubkey>,
    
    /// Number of times protocol has been paused
    pub pause_count: u32,
    
    /// Bump seed for PDA
    pub bump: u8,
    
    /// Reserved space
    pub reserved: [u8; 128],
}

impl EmergencyState {
    pub const MAX_REASON_LENGTH: usize = 256;
    pub const MAX_EMERGENCY_CONTACTS: usize = 5;
    
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        1 +  // paused
        4 + Self::MAX_REASON_LENGTH + // pause_reason
        8 +  // paused_at
        32 + // paused_by
        4 + (32 * Self::MAX_EMERGENCY_CONTACTS) + // emergency_contacts
        4 +  // pause_count
        1 +  // bump
        128; // reserved

    /// Check if caller can execute emergency actions
    pub fn can_emergency_action(&self, caller: &Pubkey) -> bool {
        if caller == &self.authority {
            return true;
        }
        self.emergency_contacts.contains(caller)
    }
}

