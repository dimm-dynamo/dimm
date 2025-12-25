use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use crate::errors::DimmError;
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
pub struct RequestSol<'info> {
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

    #[account(mut)]
    pub main_wallet: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<RequestSol>, amount: u64, reason: String) -> Result<()> {
    let agent_account = &mut ctx.accounts.agent_account;
    let clock = Clock::get()?;

    // Validate
    require!(!agent_account.revoked, DimmError::AgentRevoked);
    require!(amount > 0, DimmError::InvalidAmount);
    require!(reason.len() <= MAX_REASON_LENGTH, DimmError::ReasonTooLong);

    // Check and reset daily limit if needed
    agent_account.check_and_reset_daily_limit(clock.unix_timestamp)?;

    // Check if agent can spend this amount
    require!(
        agent_account.can_spend(amount)?,
        DimmError::ExceedsDailyLimit
    );

    // Transfer SOL from main wallet to agent
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        Transfer {
            from: ctx.accounts.main_wallet.to_account_info(),
            to: ctx.accounts.agent_account.to_account_info(),
        },
    );

    transfer(cpi_context, amount)?;

    msg!("SOL requested and transferred to agent");
    msg!("Agent: {}", ctx.accounts.agent_account.key());
    msg!("Amount: {} lamports", amount);
    msg!("Reason: {}", reason);

    Ok(())
}


