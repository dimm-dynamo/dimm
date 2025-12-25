use anchor_lang::prelude::*;

#[error_code]
pub enum DimmError {
    #[msg("Agent name is too long")]
    AgentNameTooLong,

    #[msg("Transaction amount exceeds per-transaction limit")]
    ExceedsTransactionLimit,

    #[msg("Transaction would exceed daily limit")]
    ExceedsDailyLimit,

    #[msg("Agent does not have permission for this operation")]
    InsufficientPermissions,

    #[msg("Agent is revoked and cannot perform operations")]
    AgentRevoked,

    #[msg("Invalid amount specified")]
    InvalidAmount,

    #[msg("Insufficient balance in agent account")]
    InsufficientBalance,

    #[msg("Maximum number of agents reached")]
    MaxAgentsReached,

    #[msg("Reason string is too long")]
    ReasonTooLong,

    #[msg("Invalid merkle proof provided")]
    InvalidMerkleProof,

    #[msg("Agent not found in merkle tree")]
    AgentNotFound,

    #[msg("Unauthorized: caller is not the main wallet")]
    Unauthorized,

    #[msg("Invalid permission specified")]
    InvalidPermission,

    #[msg("Daily limit must be greater than or equal to transaction limit")]
    InvalidLimitConfiguration,

    #[msg("Agent account has insufficient SOL for operation")]
    InsufficientAgentBalance,

    #[msg("Numerical overflow occurred")]
    NumericalOverflow,

    #[msg("Activity window calculation failed")]
    InvalidActivityWindow,
}


