use anchor_lang::prelude::*;
use crate::errors::DimmError;
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
pub struct WithdrawFromAgent<'info> {
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

pub fn handler(ctx: Context<WithdrawFromAgent>, amount: u64) -> Result<()> {
    require!(amount > 0, DimmError::InvalidAmount);

    let agent_account = &ctx.accounts.agent_account;
    let agent_balance = agent_account.to_account_info().lamports();

    // Ensure we keep minimum balance for rent
    let available_balance = agent_balance
        .checked_sub(MIN_AGENT_BALANCE)
        .ok_or(DimmError::InsufficientBalance)?;

    require!(
        amount <= available_balance,
        DimmError::InsufficientBalance
    );

    // Transfer from agent to main wallet
    **ctx.accounts.agent_account.to_account_info().try_borrow_mut_lamports()? -= amount;
    **ctx.accounts.main_wallet.to_account_info().try_borrow_mut_lamports()? += amount;

    msg!("Withdrawal successful");
    msg!("Agent: {}", ctx.accounts.agent_account.key());
    msg!("Amount: {} lamports", amount);
    msg!("Remaining balance: {} lamports", agent_balance - amount);

    Ok(())
}

