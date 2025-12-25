use anchor_lang::prelude::*;
use crate::errors::DimmError;
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
#[instruction(params: ActivityParams)]
pub struct RecordActivity<'info> {
    #[account(
        seeds = [
            AGENT_SEED,
            agent_account.main_wallet.as_ref(),
            &agent_account.agent_id.to_le_bytes()
        ],
        bump = agent_account.bump,
    )]
    pub agent_account: Account<'info, AgentAccount>,

    #[account(
        init,
        payer = payer,
        space = AgentActivity::LEN,
        seeds = [
            ACTIVITY_SEED,
            agent_account.key().as_ref(),
            &agent_account.total_transactions.to_le_bytes()
        ],
        bump
    )]
    pub activity: Account<'info, AgentActivity>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<RecordActivity>, params: ActivityParams) -> Result<()> {
    let activity = &mut ctx.accounts.activity;
    let clock = Clock::get()?;

    require!(
        params.reason.len() <= MAX_REASON_LENGTH,
        DimmError::ReasonTooLong
    );

    activity.agent = ctx.accounts.agent_account.key();
    activity.activity_type = params.activity_type;
    activity.amount = params.amount;
    activity.destination = params.destination;
    activity.reason = params.reason;
    activity.timestamp = clock.unix_timestamp;
    activity.signature = params.signature;
    activity.success = params.success;
    activity.bump = ctx.bumps.activity;

    msg!("Activity recorded");
    msg!("Agent: {}", activity.agent);
    msg!("Type: {:?}", activity.activity_type);
    msg!("Amount: {} lamports", activity.amount);
    msg!("Success: {}", activity.success);

    Ok(())
}

