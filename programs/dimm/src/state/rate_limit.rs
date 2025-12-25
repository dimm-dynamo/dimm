use anchor_lang::prelude::*;

/// Rate limiting configuration for agents
#[account]
pub struct RateLimit {
    /// Agent this rate limit belongs to
    pub agent: Pubkey,
    
    /// Maximum transactions per minute
    pub max_tx_per_minute: u16,
    
    /// Maximum transactions per hour
    pub max_tx_per_hour: u16,
    
    /// Current minute window start
    pub minute_window_start: i64,
    
    /// Transactions in current minute
    pub tx_this_minute: u16,
    
    /// Current hour window start
    pub hour_window_start: i64,
    
    /// Transactions in current hour
    pub tx_this_hour: u16,
    
    /// Cooldown period after limit hit (seconds)
    pub cooldown_seconds: u32,
    
    /// Last cooldown start timestamp
    pub last_cooldown_start: i64,
    
    /// Whether currently in cooldown
    pub in_cooldown: bool,
    
    /// Total times rate limited
    pub total_rate_limits: u32,
    
    /// Bump seed for PDA
    pub bump: u8,
    
    /// Reserved space
    pub reserved: [u8; 64],
}

impl RateLimit {
    pub const LEN: usize = 8 + // discriminator
        32 + // agent
        2 +  // max_tx_per_minute
        2 +  // max_tx_per_hour
        8 +  // minute_window_start
        2 +  // tx_this_minute
        8 +  // hour_window_start
        2 +  // tx_this_hour
        4 +  // cooldown_seconds
        8 +  // last_cooldown_start
        1 +  // in_cooldown
        4 +  // total_rate_limits
        1 +  // bump
        64;  // reserved

    /// Check if transaction is allowed under rate limits
    pub fn can_transact(&mut self, current_time: i64) -> Result<bool> {
        // Check if in cooldown
        if self.in_cooldown {
            let cooldown_elapsed = current_time
                .checked_sub(self.last_cooldown_start)
                .ok_or(crate::errors::DimmError::InvalidActivityWindow)?;
                
            if cooldown_elapsed < self.cooldown_seconds as i64 {
                return Ok(false);
            } else {
                self.in_cooldown = false;
            }
        }
        
        // Reset minute window if needed
        let minute_elapsed = current_time
            .checked_sub(self.minute_window_start)
            .ok_or(crate::errors::DimmError::InvalidActivityWindow)?;
            
        if minute_elapsed >= 60 {
            self.minute_window_start = current_time;
            self.tx_this_minute = 0;
        }
        
        // Reset hour window if needed
        let hour_elapsed = current_time
            .checked_sub(self.hour_window_start)
            .ok_or(crate::errors::DimmError::InvalidActivityWindow)?;
            
        if hour_elapsed >= 3600 {
            self.hour_window_start = current_time;
            self.tx_this_hour = 0;
        }
        
        // Check limits
        if self.tx_this_minute >= self.max_tx_per_minute ||
           self.tx_this_hour >= self.max_tx_per_hour {
            self.in_cooldown = true;
            self.last_cooldown_start = current_time;
            self.total_rate_limits = self.total_rate_limits
                .checked_add(1)
                .ok_or(crate::errors::DimmError::NumericalOverflow)?;
            return Ok(false);
        }
        
        Ok(true)
    }

    /// Record a transaction
    pub fn record_transaction(&mut self) -> Result<()> {
        self.tx_this_minute = self.tx_this_minute
            .checked_add(1)
            .ok_or(crate::errors::DimmError::NumericalOverflow)?;
            
        self.tx_this_hour = self.tx_this_hour
            .checked_add(1)
            .ok_or(crate::errors::DimmError::NumericalOverflow)?;
            
        Ok(())
    }
}

