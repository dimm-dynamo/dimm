# DIMM Program Documentation

## Overview

The DIMM Solana program is built using Anchor framework and manages the core protocol logic for AI agent SubAccounts.

## Program Structure

```
programs/dimm/src/
├── lib.rs              # Main program entry point
├── constants.rs        # Protocol constants
├── errors.rs           # Error definitions
├── state/              # Account state structures
│   ├── mod.rs
│   ├── protocol_config.rs
│   ├── agent_account.rs
│   └── agent_activity.rs
└── instructions/       # Instruction handlers
    ├── mod.rs
    ├── initialize.rs
    ├── create_agent.rs
    ├── fund_agent.rs
    ├── request_sol.rs
    ├── execute_transaction.rs
    ├── update_permissions.rs
    ├── revoke_agent.rs
    ├── withdraw_from_agent.rs
    ├── update_limits.rs
    └── record_activity.rs
```

## Instructions

### initialize

Initialize the DIMM protocol for a main wallet.

**Accounts:**
- `protocol_config` - PDA storing protocol configuration (init)
- `authority` - Main wallet (signer, mut)
- `merkle_tree` - Merkle tree for agent cNFTs
- `tree_authority` - Tree authority PDA
- Program accounts (Bubblegum, Compression, etc.)

**Parameters:**
```rust
pub struct InitializeParams {
    pub max_depth: u32,
    pub max_buffer_size: u32,
}
```

### create_agent

Create a new AI agent SubAccount.

**Accounts:**
- `protocol_config` - Protocol config PDA (mut)
- `agent_account` - New agent account PDA (init)
- `main_wallet` - Main wallet (signer, mut)
- `system_program`

**Parameters:**
```rust
pub struct CreateAgentParams {
    pub name: String,
    pub permissions: Vec<AgentPermission>,
    pub max_sol_per_transaction: u64,
    pub daily_limit: u64,
}
```

**Constraints:**
- Name must be ≤ 32 characters
- Daily limit ≥ max_sol_per_transaction
- Total agents < MAX_AGENTS_PER_WALLET (10,000)

### fund_agent

Transfer SOL from main wallet to agent.

**Accounts:**
- `agent_account` - Agent to fund (mut)
- `main_wallet` - Main wallet (signer, mut)
- `system_program`

**Parameters:**
- `amount: u64` - Amount in lamports

**Constraints:**
- Amount > 0
- Main wallet must be agent owner

### request_sol

Agent requests SOL from main wallet (with reason).

**Accounts:**
- `agent_account` - Agent account (mut)
- `main_wallet` - Main wallet (signer, mut)
- `system_program`

**Parameters:**
- `amount: u64` - Amount in lamports
- `reason: String` - Reason for request (≤ 128 chars)

**Constraints:**
- Agent not revoked
- Amount within daily limit
- Reason length ≤ MAX_REASON_LENGTH

### execute_transaction

Execute a transaction through an agent.

**Accounts:**
- `agent_account` - Agent executing (mut)
- `destination` - Destination account (mut)
- `authority` - Transaction authority (signer, mut)
- `system_program`

**Parameters:**
```rust
pub struct ExecuteTransactionParams {
    pub activity_type: ActivityType,
    pub amount: u64,
    pub destination: Option<Pubkey>,
    pub instruction_data: Vec<u8>,
}
```

**Validations:**
1. Agent not revoked
2. Agent has required permission for activity type
3. Amount ≤ max_sol_per_transaction
4. Amount within daily limit
5. Agent has sufficient balance

### update_permissions

Update an agent's permissions.

**Accounts:**
- `agent_account` - Agent to update (mut)
- `main_wallet` - Main wallet (signer)

**Parameters:**
- `new_permissions: Vec<AgentPermission>`

**Constraints:**
- Only main wallet can update

### update_limits

Update an agent's spending limits.

**Accounts:**
- `agent_account` - Agent to update (mut)
- `main_wallet` - Main wallet (signer)

**Parameters:**
```rust
pub struct UpdateLimitsParams {
    pub max_sol_per_transaction: Option<u64>,
    pub daily_limit: Option<u64>,
}
```

**Constraints:**
- daily_limit ≥ max_sol_per_transaction

### revoke_agent

Permanently revoke an agent's access.

**Accounts:**
- `agent_account` - Agent to revoke (mut)
- `main_wallet` - Main wallet (signer)

**Effect:**
- Sets `agent.revoked = true`
- Agent cannot execute further transactions

### withdraw_from_agent

Withdraw SOL from agent back to main wallet.

**Accounts:**
- `agent_account` - Agent to withdraw from (mut)
- `main_wallet` - Main wallet (signer, mut)
- `system_program`

**Parameters:**
- `amount: u64` - Amount in lamports

**Constraints:**
- Agent balance > amount + MIN_AGENT_BALANCE
- Maintains rent-exempt minimum

### record_activity

Record agent activity on-chain.

**Accounts:**
- `agent_account` - Related agent
- `activity` - New activity account (init)
- `payer` - Transaction payer (signer, mut)
- `system_program`

**Parameters:**
```rust
pub struct ActivityParams {
    pub activity_type: ActivityType,
    pub amount: u64,
    pub destination: Option<Pubkey>,
    pub reason: String,
    pub signature: [u8; 64],
    pub success: bool,
}
```

## State Accounts

### ProtocolConfig

```rust
pub struct ProtocolConfig {
    pub authority: Pubkey,      // 32 bytes
    pub merkle_tree: Pubkey,    // 32 bytes
    pub total_agents: u64,      // 8 bytes
    pub version: u8,            // 1 byte
    pub paused: bool,           // 1 byte
    pub bump: u8,               // 1 byte
    pub reserved: [u8; 64],     // 64 bytes
}
// Total: 139 bytes + 8 discriminator = 147 bytes
```

**PDA:** `["dimm_protocol", main_wallet]`

### AgentAccount

```rust
pub struct AgentAccount {
    pub main_wallet: Pubkey,
    pub agent_id: u64,
    pub name: String,
    pub permissions: Vec<AgentPermission>,
    pub max_sol_per_transaction: u64,
    pub daily_limit: u64,
    pub spent_today: u64,
    pub last_daily_reset: i64,
    pub total_spent: u64,
    pub total_transactions: u64,
    pub revoked: bool,
    pub created_at: i64,
    pub last_used_at: i64,
    pub leaf_index: u32,
    pub bump: u8,
    pub reserved: [u8; 128],
}
// Total: ~450 bytes
```

**PDA:** `["dimm_agent", main_wallet, agent_id]`

### AgentActivity

```rust
pub struct AgentActivity {
    pub agent: Pubkey,
    pub activity_type: ActivityType,
    pub amount: u64,
    pub destination: Option<Pubkey>,
    pub reason: String,
    pub timestamp: i64,
    pub signature: [u8; 64],
    pub success: bool,
    pub bump: u8,
}
// Total: ~280 bytes
```

**PDA:** `["dimm_activity", agent, tx_count]`

## Enums

### AgentPermission

```rust
pub enum AgentPermission {
    TransferSol,      // Send SOL
    SwapTokens,       // DEX operations
    NftOperations,    // NFT interactions
    Staking,          // Staking operations
    Governance,       // DAO voting
    DefiProtocols,    // DeFi protocols
    TokenAccounts,    // Token account management
    ExecutePrograms,  // Arbitrary program calls
}
```

### ActivityType

```rust
pub enum ActivityType {
    Transfer,
    Swap,
    NftOperation,
    Staking,
    Governance,
    DefiInteraction,
    Funding,
    Withdrawal,
    Other,
}
```

## Errors

```rust
pub enum DimmError {
    AgentNameTooLong,
    ExceedsTransactionLimit,
    ExceedsDailyLimit,
    InsufficientPermissions,
    AgentRevoked,
    InvalidAmount,
    InsufficientBalance,
    MaxAgentsReached,
    ReasonTooLong,
    InvalidMerkleProof,
    AgentNotFound,
    Unauthorized,
    InvalidPermission,
    InvalidLimitConfiguration,
    InsufficientAgentBalance,
    NumericalOverflow,
    InvalidActivityWindow,
}
```

## Constants

```rust
pub const PROTOCOL_SEED: &[u8] = b"dimm_protocol";
pub const AGENT_SEED: &[u8] = b"dimm_agent";
pub const ACTIVITY_SEED: &[u8] = b"dimm_activity";
pub const TREE_AUTHORITY_SEED: &[u8] = b"tree_authority";

pub const MAX_AGENTS_PER_WALLET: u16 = 10000;
pub const MAX_AGENT_NAME_LENGTH: usize = 32;
pub const MAX_REASON_LENGTH: usize = 128;
pub const MIN_AGENT_BALANCE: u64 = 5_000_000; // 0.005 SOL

pub const DEFAULT_DAILY_LIMIT: u64 = 1_000_000_000; // 1 SOL
pub const DEFAULT_TX_LIMIT: u64 = 100_000_000; // 0.1 SOL
pub const DAILY_WINDOW_SECONDS: i64 = 86400; // 24 hours
```

## Building and Deploying

### Build

```bash
anchor build
```

### Test

```bash
anchor test
```

### Deploy to Devnet

```bash
anchor deploy --provider.cluster devnet
```

### Deploy to Mainnet

```bash
anchor deploy --provider.cluster mainnet
```

## Upgrades

The program is upgradeable using Anchor's upgrade authority.

To upgrade:

```bash
anchor upgrade <PROGRAM_ID> --program-id <NEW_PROGRAM_PATH>
```

**Important:** Test upgrades on devnet first!

## Cost Estimates

### Account Rent

- ProtocolConfig: ~0.002 SOL
- AgentAccount: ~0.003 SOL
- AgentActivity: ~0.002 SOL

### Transaction Costs

- Initialize: ~0.000005 SOL
- Create Agent: ~0.003 SOL (account rent + tx)
- Fund Agent: ~0.000005 SOL
- Execute Transaction: ~0.000005 SOL

## Performance

- **TPS**: Limited by Solana network (~3,000 TPS)
- **Agent Creation**: ~1 second
- **Transaction Execution**: ~1 second
- **Query Time**: <100ms

## Security Considerations

1. **PDA Security**: All PDAs use proper seeds and bumps
2. **Signer Checks**: Main wallet signatures required for sensitive operations
3. **Spending Limits**: Enforced on-chain
4. **State Validation**: All state transitions validated
5. **Overflow Protection**: Safe math operations

## Future Improvements

- [ ] Cross-program invocation support
- [ ] Batch operations
- [ ] Advanced permission system
- [ ] Multi-signature support
- [ ] Governance module

## Resources

- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Documentation](https://docs.solana.com/)
- [DIMM GitHub](https://github.com/yourusername/dimm)


