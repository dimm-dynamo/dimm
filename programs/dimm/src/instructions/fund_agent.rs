use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use crate::errors::DimmError;
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
pub struct FundAgent<'info> {
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

pub fn handler(ctx: Context<FundAgent>, amount: u64) -> Result<()> {
    require!(amount > 0, DimmError::InvalidAmount);

    // Transfer SOL from main wallet to agent account
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        Transfer {
            from: ctx.accounts.main_wallet.to_account_info(),
            to: ctx.accounts.agent_account.to_account_info(),
        },
    );

    transfer(cpi_context, amount)?;

    msg!("Agent funded successfully");
    msg!("Agent: {}", ctx.accounts.agent_account.key());
    msg!("Amount: {} lamports ({} SOL)", amount, amount as f64 / 1_000_000_000.0);

    Ok(())
}


