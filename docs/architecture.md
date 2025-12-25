# DIMM Architecture

## Overview

DIMM (Dynamic Intelligence Multi-Modal) provides a secure and scalable infrastructure for AI agents to interact with the Solana blockchain without exposing private keys. The system uses compressed NFTs (cNFTs) and merkle trees to manage SubAccounts efficiently.

## Core Components

### 1. Solana Program (Rust/Anchor)

The on-chain program manages the core protocol logic:

- **Protocol Configuration**: Stores global settings and merkle tree references
- **Agent Accounts**: Individual SubAccounts for each AI agent
- **Activity Logging**: On-chain audit trail of all agent actions
- **Permission System**: Granular access control for agent capabilities

### 2. TypeScript SDK

The SDK provides a high-level interface for:

- Creating and managing AI agents
- Executing transactions through agents
- Monitoring agent activity and spending
- Managing permissions and limits

### 3. cNFT Integration

Compressed NFTs enable scalable agent management:

- Each agent is represented as a cNFT in a merkle tree
- Supports up to 10,000 agents per main wallet
- Minimal storage costs compared to traditional NFTs
- Fast verification through merkle proofs

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   AI Services Layer                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   GPT-4  │  │  Claude  │  │  Custom  │             │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
└───────┼─────────────┼─────────────┼───────────────────┘
        │             │             │
        └─────────────┴─────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              DIMM TypeScript SDK                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  DimmClient                                       │  │
│  │  - createAgent()     - executeTransaction()      │  │
│  │  - fundAgent()       - updatePermissions()       │  │
│  │  - listAgents()      - revokeAgent()             │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Agent Class                                      │  │
│  │  - transferSol()     - getBalance()              │  │
│  │  - canSpend()        - getStats()                │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│            DIMM Solana Program (Rust)                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Instructions                                     │  │
│  │  - initialize        - execute_transaction       │  │
│  │  - create_agent      - update_permissions        │  │
│  │  - fund_agent        - revoke_agent              │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  State Accounts                                   │  │
│  │  - ProtocolConfig    - AgentActivity             │  │
│  │  - AgentAccount                                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│         SPL Account Compression (cNFT)                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Merkle Tree                                      │  │
│  │  - Stores agent cNFTs                            │  │
│  │  - Scalable to 10,000+ agents                    │  │
│  │  - Efficient proof verification                  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                  Solana Blockchain                      │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### Agent Creation

1. User calls `dimmClient.createAgent()` with agent parameters
2. SDK derives agent PDA from main wallet + agent ID
3. Program creates AgentAccount with specified permissions and limits
4. Agent cNFT is minted into the merkle tree
5. SDK returns Agent instance

### Transaction Execution

1. AI agent calls `agent.transferSol()` or similar method
2. SDK verifies permissions locally
3. Program validates:
   - Agent is not revoked
   - Agent has required permission
   - Amount is within per-transaction limit
   - Daily limit is not exceeded
4. If valid, transaction is executed
5. Agent spending is recorded on-chain
6. Activity log is created

### SOL Request Flow

1. Agent determines it needs more SOL
2. Agent calls `agent.fund(amount)` or `requestSol(amount, reason)`
3. Main wallet must approve the request
4. SOL is transferred to agent SubAccount
5. Agent can now execute transactions

## Security Model

### Permission Layers

1. **Main Wallet**: Full control over all agents
   - Create/revoke agents
   - Update permissions and limits
   - Withdraw funds
   - Emergency pause

2. **Agent SubAccount**: Limited permissions
   - Execute only allowed operations
   - Respect spending limits
   - Cannot modify own permissions
   - Cannot access other agents

### Spending Controls

- **Per-Transaction Limit**: Maximum SOL per single transaction
- **Daily Limit**: Maximum SOL per 24-hour period
- **Activity Reset**: Daily limits reset automatically
- **Balance Check**: Ensures minimum balance for rent

### Audit Trail

All agent activities are recorded:
- Transaction type and amount
- Destination address
- Timestamp
- Success/failure status
- Reason/description

## cNFT Structure

### Merkle Tree Configuration

```rust
pub struct MerkleTreeConfig {
    max_depth: 14,        // Supports 16,384 agents
    max_buffer_size: 64,  // Concurrent operations
}
```

### Agent cNFT Metadata

```rust
pub struct AgentMetadata {
    agent_id: u64,
    name: String,
    created_at: i64,
    main_wallet: Pubkey,
}
```

### Benefits

- **Low Cost**: ~0.00001 SOL per agent vs ~0.01 SOL for regular NFT
- **Scalability**: Thousands of agents without bloating state
- **Composability**: Compatible with existing cNFT tooling
- **Verification**: Fast merkle proof validation

## State Management

### Protocol Config Account

```rust
pub struct ProtocolConfig {
    authority: Pubkey,      // Main wallet
    merkle_tree: Pubkey,    // cNFT tree
    total_agents: u64,      // Agent counter
    version: u8,            // Protocol version
    paused: bool,           // Emergency pause
}
```

### Agent Account

```rust
pub struct AgentAccount {
    main_wallet: Pubkey,
    agent_id: u64,
    name: String,
    permissions: Vec<AgentPermission>,
    max_sol_per_transaction: u64,
    daily_limit: u64,
    spent_today: u64,
    last_daily_reset: i64,
    total_spent: u64,
    total_transactions: u64,
    revoked: bool,
    created_at: i64,
    last_used_at: i64,
    leaf_index: u32,
}
```

## Scaling Considerations

### Horizontal Scaling

- Multiple merkle trees for different agent types
- Sharding by main wallet
- Batch operations for multiple agents

### Vertical Scaling

- Optimized account sizes
- Efficient PDA derivation
- Minimal CPI calls

### Cost Optimization

- cNFTs reduce storage costs by 99%
- Batch multiple operations in single transaction
- Rent-exempt account sizing

## Future Enhancements

1. **Cross-Program Invocations**: Enable agents to interact with any Solana program
2. **Multi-Signature Agents**: Require multiple approvals for high-value transactions
3. **Delegation Chains**: Agents creating sub-agents with limited permissions
4. **Analytics Dashboard**: Real-time monitoring and insights
5. **Governance Module**: Community-driven protocol upgrades


