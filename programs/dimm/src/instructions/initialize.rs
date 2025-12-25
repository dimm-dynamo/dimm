use anchor_lang::prelude::*;
use crate::constants::*;
use crate::state::*;
use mpl_bubblegum::program::Bubblegum;
use spl_account_compression::{program::SplAccountCompression, Noop};

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = ProtocolConfig::LEN,
        seeds = [PROTOCOL_SEED, authority.key().as_ref()],
        bump
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: This account is initialized by the account compression program
    #[account(zero)]
    pub merkle_tree: UncheckedAccount<'info>,

    /// CHECK: Tree authority PDA
    #[account(
        seeds = [merkle_tree.key().as_ref()],
        bump,
        seeds::program = bubblegum_program.key()
    )]
    pub tree_authority: UncheckedAccount<'info>,

    pub bubblegum_program: Program<'info, Bubblegum>,
    pub compression_program: Program<'info, SplAccountCompression>,
    pub log_wrapper: Program<'info, Noop>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>, params: InitializeParams) -> Result<()> {
    let protocol_config = &mut ctx.accounts.protocol_config;
    
    protocol_config.authority = ctx.accounts.authority.key();
    protocol_config.merkle_tree = ctx.accounts.merkle_tree.key();
    protocol_config.total_agents = 0;
    protocol_config.version = 1;
    protocol_config.paused = false;
    protocol_config.bump = ctx.bumps.protocol_config;

    msg!("DIMM Protocol initialized");
    msg!("Authority: {}", protocol_config.authority);
    msg!("Merkle Tree: {}", protocol_config.merkle_tree);
    msg!("Max Depth: {}", params.max_depth);
    msg!("Max Buffer Size: {}", params.max_buffer_size);

    Ok(())
}


