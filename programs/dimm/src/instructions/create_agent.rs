use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use crate::constants::*;
use crate::errors::DimmError;
use crate::state::*;

#[derive(Accounts)]
#[instruction(params: CreateAgentParams)]
pub struct CreateAgent<'info> {
    #[account(
        mut,
        seeds = [PROTOCOL_SEED, main_wallet.key().as_ref()],
        bump = protocol_config.bump
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(
        init,
        payer = main_wallet,
        space = AgentAccount::LEN,
        seeds = [
            AGENT_SEED,
            main_wallet.key().as_ref(),
            &protocol_config.total_agents.to_le_bytes()
        ],
        bump
    )]
    pub agent_account: Account<'info, AgentAccount>,

    #[account(mut)]
    pub main_wallet: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateAgent>, params: CreateAgentParams) -> Result<()> {
    let protocol_config = &mut ctx.accounts.protocol_config;
    let agent_account = &mut ctx.accounts.agent_account;
    let clock = Clock::get()?;

    // Validate inputs
    require!(
        params.name.len() <= MAX_AGENT_NAME_LENGTH,
        DimmError::AgentNameTooLong
    );

    require!(
        params.daily_limit >= params.max_sol_per_transaction,
        DimmError::InvalidLimitConfiguration
    );

    require!(
        protocol_config.total_agents < MAX_AGENTS_PER_WALLET as u64,
        DimmError::MaxAgentsReached
    );

    // Initialize agent account
    agent_account.main_wallet = ctx.accounts.main_wallet.key();
    agent_account.agent_id = protocol_config.total_agents;
    agent_account.name = params.name.clone();
    agent_account.permissions = params.permissions;
    agent_account.max_sol_per_transaction = params.max_sol_per_transaction;
    agent_account.daily_limit = params.daily_limit;
    agent_account.spent_today = 0;
    agent_account.last_daily_reset = clock.unix_timestamp;
    agent_account.total_spent = 0;
    agent_account.total_transactions = 0;
    agent_account.revoked = false;
    agent_account.created_at = clock.unix_timestamp;
    agent_account.last_used_at = clock.unix_timestamp;
    agent_account.leaf_index = protocol_config.total_agents as u32;
    agent_account.bump = ctx.bumps.agent_account;

    // Increment total agents
    protocol_config.total_agents = protocol_config
        .total_agents
        .checked_add(1)
        .ok_or(DimmError::NumericalOverflow)?;

    msg!("Agent created successfully");
    msg!("Agent ID: {}", agent_account.agent_id);
    msg!("Agent Name: {}", agent_account.name);
    msg!("Agent Address: {}", ctx.accounts.agent_account.key());
    msg!("Main Wallet: {}", agent_account.main_wallet);

    Ok(())
}


