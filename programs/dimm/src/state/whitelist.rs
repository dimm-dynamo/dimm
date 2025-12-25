use anchor_lang::prelude::*;

/// Whitelist for approved destinations/programs
#[account]
pub struct Whitelist {
    /// Protocol or agent this whitelist belongs to
    pub owner: Pubkey,
    
    /// List of whitelisted addresses (max 100)
    pub addresses: Vec<Pubkey>,
    
    /// Whether whitelist is enabled
    pub enabled: bool,
    
    /// Whitelist type
    pub whitelist_type: WhitelistType,
    
    /// Last updated timestamp
    pub last_updated: i64,
    
    /// Bump seed for PDA
    pub bump: u8,
    
    /// Reserved space
    pub reserved: [u8; 64],
}

impl Whitelist {
    pub const MAX_ADDRESSES: usize = 100;
    
    pub const LEN: usize = 8 + // discriminator
        32 + // owner
        4 + (32 * Self::MAX_ADDRESSES) + // addresses
        1 +  // enabled
        1 +  // whitelist_type
        8 +  // last_updated
        1 +  // bump
        64;  // reserved

    /// Check if an address is whitelisted
    pub fn is_whitelisted(&self, address: &Pubkey) -> bool {
        if !self.enabled {
            return true; // If whitelist is disabled, all addresses are allowed
        }
        self.addresses.contains(address)
    }

    /// Add address to whitelist
    pub fn add_address(&mut self, address: Pubkey) -> Result<()> {
        require!(
            self.addresses.len() < Self::MAX_ADDRESSES,
            crate::errors::DimmError::MaxAgentsReached
        );
        
        if !self.addresses.contains(&address) {
            self.addresses.push(address);
        }
        
        Ok(())
    }

    /// Remove address from whitelist
    pub fn remove_address(&mut self, address: &Pubkey) -> Result<()> {
        self.addresses.retain(|addr| addr != address);
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum WhitelistType {
    /// Whitelist for transfer destinations
    Destinations,
    
    /// Whitelist for programs that can be called
    Programs,
    
    /// Whitelist for token mints
    Tokens,
    
    /// Whitelist for NFT collections
    Collections,
}

