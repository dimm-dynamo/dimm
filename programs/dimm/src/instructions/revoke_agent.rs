use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
pub struct RevokeAgent<'info> {
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

pub fn handler(ctx: Context<RevokeAgent>) -> Result<()> {
    let agent_account = &mut ctx.accounts.agent_account;

    agent_account.revoked = true;

    msg!("Agent revoked");
    msg!("Agent: {}", ctx.accounts.agent_account.key());
    msg!("Agent ID: {}", agent_account.agent_id);

    Ok(())
}


