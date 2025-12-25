use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use crate::errors::DimmError;
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
pub struct ExecuteTransaction<'info> {
    #[account(
        mut,
        seeds = [
            AGENT_SEED,
            agent_account.main_wallet.as_ref(),
            &agent_account.agent_id.to_le_bytes()
        ],
        bump = agent_account.bump,
    )]
    pub agent_account: Account<'info, AgentAccount>,

    /// CHECK: Destination can be any account
    #[account(mut)]
    pub destination: UncheckedAccount<'info>,

    /// The signer must be authorized (for demo, we allow the main wallet)
    #[account(mut, address = agent_account.main_wallet)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<ExecuteTransaction>,
    params: ExecuteTransactionParams,
) -> Result<()> {
    let agent_account = &mut ctx.accounts.agent_account;
    let clock = Clock::get()?;

    // Validate agent is not revoked
    require!(!agent_account.revoked, DimmError::AgentRevoked);

    // Check permissions based on activity type
    let required_permission = match params.activity_type {
        ActivityType::Transfer => AgentPermission::TransferSol,
        ActivityType::Swap => AgentPermission::SwapTokens,
        ActivityType::NftOperation => AgentPermission::NftOperations,
        ActivityType::Staking => AgentPermission::Staking,
        ActivityType::Governance => AgentPermission::Governance,
        ActivityType::DefiInteraction => AgentPermission::DefiProtocols,
        _ => AgentPermission::ExecutePrograms,
    };

    require!(
        agent_account.has_permission(&required_permission),
        DimmError::InsufficientPermissions
    );

    // Check and reset daily limit if needed
    agent_account.check_and_reset_daily_limit(clock.unix_timestamp)?;

    // Validate spending limits
    if params.amount > 0 {
        require!(
            params.amount <= agent_account.max_sol_per_transaction,
            DimmError::ExceedsTransactionLimit
        );

        require!(
            agent_account.can_spend(params.amount)?,
            DimmError::ExceedsDailyLimit
        );

        // Check agent has sufficient balance
        let agent_balance = ctx.accounts.agent_account.to_account_info().lamports();
        let required_balance = params.amount
            .checked_add(MIN_AGENT_BALANCE)
            .ok_or(DimmError::NumericalOverflow)?;
            
        require!(
            agent_balance >= required_balance,
            DimmError::InsufficientAgentBalance
        );

        // Execute transfer if it's a simple SOL transfer
        if params.activity_type == ActivityType::Transfer && params.destination.is_some() {
            let agent_seeds = &[
                AGENT_SEED,
                agent_account.main_wallet.as_ref(),
                &agent_account.agent_id.to_le_bytes(),
                &[agent_account.bump],
            ];
            let signer_seeds = &[&agent_seeds[..]];

            let cpi_context = CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.agent_account.to_account_info(),
                    to: ctx.accounts.destination.to_account_info(),
                },
                signer_seeds,
            );

            transfer(cpi_context, params.amount)?;
        }

        // Record the spend
        agent_account.record_spend(params.amount)?;
    }

    // Update last used timestamp
    agent_account.last_used_at = clock.unix_timestamp;

    msg!("Transaction executed successfully");
    msg!("Agent: {}", ctx.accounts.agent_account.key());
    msg!("Type: {:?}", params.activity_type);
    msg!("Amount: {} lamports", params.amount);
    msg!("Total spent today: {} lamports", agent_account.spent_today);
    msg!("Total transactions: {}", agent_account.total_transactions);

    Ok(())
}


