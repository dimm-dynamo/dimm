use anchor_lang::prelude::*;

/// Main protocol configuration account
#[account]
pub struct ProtocolConfig {
    /// Main wallet authority
    pub authority: Pubkey,
    
    /// Merkle tree for storing agent cNFTs
    pub merkle_tree: Pubkey,
    
    /// Total number of agents created
    pub total_agents: u64,
    
    /// Protocol version
    pub version: u8,
    
    /// Whether the protocol is paused
    pub paused: bool,
    
    /// Bump seed for PDA
    pub bump: u8,
    
    /// Reserved space for future upgrades
    pub reserved: [u8; 64],
}

impl ProtocolConfig {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        32 + // merkle_tree
        8 +  // total_agents
        1 +  // version
        1 +  // paused
        1 +  // bump
        64;  // reserved
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct InitializeParams {
    /// Maximum depth of the merkle tree
    pub max_depth: u32,
    
    /// Maximum buffer size for the merkle tree
    pub max_buffer_size: u32,
}


