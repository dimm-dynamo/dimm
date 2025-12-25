# cNFT Integration

## Overview

DIMM uses compressed NFTs (cNFTs) to represent agent SubAccounts, enabling scalable and cost-effective agent management.

## What are cNFTs?

Compressed NFTs are a Solana innovation that uses merkle trees and on-chain compression to dramatically reduce the cost of minting and storing NFTs.

### Traditional NFT vs cNFT

| Aspect | Traditional NFT | cNFT |
|--------|----------------|------|
| Storage Cost | ~0.01-0.02 SOL | ~0.00001 SOL |
| Account Size | Full account | Merkle proof |
| Scalability | Limited | Massive (1M+) |
| Verification | Direct lookup | Merkle proof |

## How DIMM Uses cNFTs

### Agent Representation

Each AI agent is represented as a cNFT in a merkle tree:

```
Merkle Tree
├── Agent 0 (cNFT)
├── Agent 1 (cNFT)
├── Agent 2 (cNFT)
└── ...
```

### Benefits

1. **Cost Efficiency**: Create thousands of agents for pennies
2. **Scalability**: Support up to 16,384 agents per tree
3. **Composability**: Compatible with existing cNFT infrastructure
4. **Efficiency**: Fast verification through merkle proofs

## Merkle Tree Structure

### Tree Configuration

```rust
pub struct TreeConfig {
    max_depth: u32,        // Maximum tree depth
    max_buffer_size: u32,  // Concurrent operations buffer
}
```

**Default Configuration:**
- `max_depth: 14` - Supports 2^14 = 16,384 agents
- `max_buffer_size: 64` - 64 concurrent operations

### Depth vs Capacity

| Depth | Max Agents | Use Case |
|-------|-----------|----------|
| 10 | 1,024 | Small projects |
| 14 | 16,384 | Most use cases |
| 20 | 1,048,576 | Enterprise scale |

## Agent cNFT Metadata

Each agent cNFT contains:

```json
{
  "name": "DIMM Agent #0",
  "symbol": "DIMM",
  "uri": "https://dimm.ai/metadata/agent/0",
  "sellerFeeBasisPoints": 0,
  "creators": [
    {
      "address": "MainWalletAddress...",
      "verified": true,
      "share": 100
    }
  ],
  "collection": {
    "verified": true,
    "key": "CollectionAddress..."
  }
}
```

### Custom Attributes

```json
{
  "attributes": [
    {
      "trait_type": "Agent ID",
      "value": "0"
    },
    {
      "trait_type": "Created",
      "value": "2025-12-25T00:00:00Z"
    },
    {
      "trait_type": "Permissions",
      "value": "TransferSol,SwapTokens"
    },
    {
      "trait_type": "Daily Limit",
      "value": "1.0 SOL"
    }
  ]
}
```

## Merkle Proof Verification

### How It Works

1. Agent cNFT is stored as a leaf in the merkle tree
2. To verify agent exists, compute merkle proof
3. Proof is submitted with transaction
4. On-chain program verifies proof against tree root

### Verification Process

```
Leaf Hash (Agent Data)
    ↓
Parent Hash (Leaf + Sibling)
    ↓
... (up the tree)
    ↓
Root Hash (verified on-chain)
```

### Code Example

```typescript
import { getConcurrentMerkleTreeAccountSize } from '@solana/spl-account-compression';

// Calculate required space for tree
const space = getConcurrentMerkleTreeAccountSize(
  maxDepth,      // 14
  maxBufferSize  // 64
);

// Approximately 4KB for this configuration
console.log('Tree size:', space, 'bytes');
```

## Integration with SPL Account Compression

DIMM integrates with Solana's SPL Account Compression program.

### Dependencies

```toml
[dependencies]
spl-account-compression = "0.3.0"
mpl-bubblegum = "1.3.0"
```

### Initialization

```rust
use mpl_bubblegum::program::Bubblegum;
use spl_account_compression::{program::SplAccountCompression, Noop};

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(zero)]
    pub merkle_tree: UncheckedAccount<'info>,
    
    #[account(
        seeds = [merkle_tree.key().as_ref()],
        bump,
        seeds::program = bubblegum_program.key()
    )]
    pub tree_authority: UncheckedAccount<'info>,
    
    pub bubblegum_program: Program<'info, Bubblegum>,
    pub compression_program: Program<'info, SplAccountCompression>,
    pub log_wrapper: Program<'info, Noop>,
}
```

## Creating Agent cNFTs

### On-Chain Process

1. Main wallet initiates agent creation
2. Agent account PDA is derived
3. cNFT is minted into merkle tree
4. Leaf index is stored in agent account
5. Agent is ready to use

### Code Flow

```rust
// 1. Create agent account
let agent_account = AgentAccount {
    main_wallet: ctx.accounts.main_wallet.key(),
    agent_id: protocol_config.total_agents,
    leaf_index: protocol_config.total_agents as u32,
    // ... other fields
};

// 2. Mint cNFT (simplified)
// In production, use mpl-bubblegum instructions
mint_to_collection_v1(
    ctx.accounts.bubblegum_program,
    ctx.accounts.merkle_tree,
    metadata,
)?;

// 3. Increment counter
protocol_config.total_agents += 1;
```

## Querying Agent cNFTs

### Using RPC

```typescript
import { Connection } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');

// Get compressed NFT by leaf index
const assetId = await getAssetId(merkleTree, leafIndex);
const asset = await connection.getAsset(assetId);

console.log(asset.content.metadata);
```

### Using Digital Asset Standard (DAS) API

```typescript
// Helius, SimpleHash, or other DAS provider
const response = await fetch('https://api.helius.xyz/v0/assets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ids: [assetId],
  }),
});

const assets = await response.json();
```

## Transferring Agent cNFTs

### Transfer Restrictions

Agent cNFTs are **non-transferable** by design:

- Ensures agent remains tied to main wallet
- Prevents unauthorized delegation
- Maintains security model

### Implementation

```rust
// cNFT is created with transfer_frozen = true
let metadata = MetadataArgs {
    name: format!("DIMM Agent #{}", agent_id),
    symbol: "DIMM".to_string(),
    uri: format!("https://dimm.ai/metadata/agent/{}", agent_id),
    seller_fee_basis_points: 0,
    primary_sale_happened: true,
    is_mutable: false,
    // ... other fields
};
```

## Burning Agent cNFTs

When an agent is revoked:

1. Agent account is marked as `revoked = true`
2. Optionally, cNFT can be burned
3. Leaf in merkle tree is marked as empty
4. Funds are withdrawn to main wallet

### Burn Process

```rust
// Simplified burn logic
pub fn revoke_agent(ctx: Context<RevokeAgent>) -> Result<()> {
    let agent = &mut ctx.accounts.agent_account;
    
    // Mark as revoked
    agent.revoked = true;
    
    // Optional: Burn cNFT
    // burn_cnft(ctx.accounts.bubblegum_program, ...)?;
    
    Ok(())
}
```

## Cost Analysis

### Traditional NFT Approach

```
Create 1000 agents:
- Account rent: 0.01 SOL × 1000 = 10 SOL
- Metadata accounts: 0.005 SOL × 1000 = 5 SOL
- Total: ~15 SOL ($1500 at $100/SOL)
```

### cNFT Approach

```
Create 1000 agents:
- Merkle tree rent: ~0.05 SOL (one-time)
- Mint cost: 0.000005 SOL × 1000 = 0.005 SOL
- Agent accounts: 0.002 SOL × 1000 = 2 SOL
- Total: ~2.055 SOL ($205 at $100/SOL)
```

**Savings: ~87% cost reduction!**

## Best Practices

### Tree Management

1. **Choose appropriate depth** based on expected agent count
2. **Monitor tree capacity** - create new tree when full
3. **Backup merkle roots** for disaster recovery
4. **Use multiple trees** for different agent types

### Performance Optimization

1. **Batch operations** when creating multiple agents
2. **Cache merkle proofs** for frequently accessed agents
3. **Use parallel verification** for bulk operations
4. **Implement retry logic** for tree contention

### Security Considerations

1. **Verify merkle proofs** on every operation
2. **Validate tree authority** PDA
3. **Check leaf existence** before operations
4. **Monitor for tree manipulation** attempts

## Future Enhancements

### Planned Features

- [ ] Cross-tree agent migration
- [ ] Hierarchical agent trees (agents creating sub-agents)
- [ ] Collection-level permissions
- [ ] Metadata updates for agent statistics
- [ ] Snapshot-based analytics

### Research Areas

- Zero-knowledge proofs for privacy
- Cross-chain cNFT bridges
- Dynamic metadata updates
- Compressed collections

## References

- [Solana Account Compression](https://docs.solana.com/developing/programming-model/account-compression)
- [Metaplex Bubblegum](https://docs.metaplex.com/programs/compression)
- [cNFT Specification](https://github.com/solana-labs/solana-program-library/tree/master/account-compression)
- [Digital Asset Standard API](https://docs.helius.dev/compression-and-das-api/digital-asset-standard-das-api)

## Support

Questions about cNFT integration? 

- GitHub Discussions
- Discord #cnft-help
- Email: cnft@dimm.ai

