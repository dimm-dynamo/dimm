use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use mpl_bubblegum::program::Bubblegum;
use spl_account_compression::{program::SplAccountCompression, Noop};

declare_id!("DimmProgram11111111111111111111111111111111");

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use errors::*;
use instructions::*;
use state::*;

#[program]
pub mod dimm {
    use super::*;

    /// Initialize the DIMM protocol with main configuration
    pub fn initialize(ctx: Context<Initialize>, params: InitializeParams) -> Result<()> {
        instructions::initialize::handler(ctx, params)
    }

    /// Create a new AI agent SubAccount using cNFT
    pub fn create_agent(ctx: Context<CreateAgent>, params: CreateAgentParams) -> Result<()> {
        instructions::create_agent::handler(ctx, params)
    }

    /// Fund an agent SubAccount from the main wallet
    pub fn fund_agent(ctx: Context<FundAgent>, amount: u64) -> Result<()> {
        instructions::fund_agent::handler(ctx, amount)
    }

    /// Request SOL from main wallet to agent SubAccount
    pub fn request_sol(ctx: Context<RequestSol>, amount: u64, reason: String) -> Result<()> {
        instructions::request_sol::handler(ctx, amount, reason)
    }

    /// Execute a transaction through an agent SubAccount
    pub fn execute_transaction(
        ctx: Context<ExecuteTransaction>,
        params: ExecuteTransactionParams,
    ) -> Result<()> {
        instructions::execute_transaction::handler(ctx, params)
    }

    /// Update agent permissions
    pub fn update_permissions(
        ctx: Context<UpdatePermissions>,
        new_permissions: Vec<AgentPermission>,
    ) -> Result<()> {
        instructions::update_permissions::handler(ctx, new_permissions)
    }

    /// Revoke agent access
    pub fn revoke_agent(ctx: Context<RevokeAgent>) -> Result<()> {
        instructions::revoke_agent::handler(ctx)
    }

    /// Withdraw remaining SOL from agent back to main wallet
    pub fn withdraw_from_agent(ctx: Context<WithdrawFromAgent>, amount: u64) -> Result<()> {
        instructions::withdraw_from_agent::handler(ctx, amount)
    }

    /// Update agent limits
    pub fn update_limits(ctx: Context<UpdateLimits>, params: UpdateLimitsParams) -> Result<()> {
        instructions::update_limits::handler(ctx, params)
    }

    /// Record agent activity (called automatically by execute_transaction)
    pub fn record_activity(ctx: Context<RecordActivity>, params: ActivityParams) -> Result<()> {
        instructions::record_activity::handler(ctx, params)
    }
}

