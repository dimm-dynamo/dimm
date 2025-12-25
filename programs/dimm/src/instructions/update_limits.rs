use anchor_lang::prelude::*;
use crate::errors::DimmError;
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
pub struct UpdateLimits<'info> {
    #[account(
        mut,
        seeds = [
            AGENT_SEED,
            main_wallet.key().as_ref(),
            &agent_account.agent_id.to_le_bytes()
        ],
        bump = agent_account.bump,
        has_one = main_wallet
    )]
    pub agent_account: Account<'info, AgentAccount>,

    pub main_wallet: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateLimits>, params: UpdateLimitsParams) -> Result<()> {
    let agent_account = &mut ctx.accounts.agent_account;

    if let Some(max_sol_per_transaction) = params.max_sol_per_transaction {
        agent_account.max_sol_per_transaction = max_sol_per_transaction;
    }

    if let Some(daily_limit) = params.daily_limit {
        agent_account.daily_limit = daily_limit;
    }

    // Validate the configuration
    require!(
        agent_account.daily_limit >= agent_account.max_sol_per_transaction,
        DimmError::InvalidLimitConfiguration
    );

    msg!("Agent limits updated");
    msg!("Agent: {}", ctx.accounts.agent_account.key());
    msg!("Max per transaction: {} lamports", agent_account.max_sol_per_transaction);
    msg!("Daily limit: {} lamports", agent_account.daily_limit);

    Ok(())
}

