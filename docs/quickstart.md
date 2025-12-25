# Quick Start Guide

**Idea from:** [Metaplex Foundation](https://github.com/metaplex-foundation)

## Prerequisites

- Rust 1.70.0+
- Solana CLI 1.18.0+
- Anchor 0.29.0+
- Node.js 18.0.0+
- pnpm

## Installation

```bash
# Clone repository
git clone https://github.com/yourusername/dimm.git
cd dimm

# Build program
anchor build

# Configure Solana
solana config set --url devnet
solana-keygen new  # or use existing wallet
solana airdrop 2

# Deploy
anchor deploy

# Build SDK
cd sdk
pnpm install
pnpm build
```

## Basic Usage

```typescript
import { Connection, Keypair } from '@solana/web3.js';
import { DimmClient, AgentPermission } from '@dimm/sdk';
import fs from 'fs';

// Setup
const connection = new Connection('https://api.devnet.solana.com');
const walletData = JSON.parse(fs.readFileSync('~/.config/solana/id.json', 'utf-8'));
const wallet = Keypair.fromSecretKey(new Uint8Array(walletData));

// Initialize client
const dimm = new DimmClient(connection, wallet);

// Create agent
const agent = await dimm.createAgent({
  name: 'MyAgent',
  permissions: [AgentPermission.TRANSFER_SOL],
  maxSolPerTransaction: 0.1,
  dailyLimit: 1.0,
});

console.log('Agent address:', agent.address.toString());

// Fund agent
await agent.fund(0.5);

// Transfer
const result = await agent.transferSol(recipientAddress, 0.01);
console.log('Transaction:', result.signature);

// Get stats
const stats = agent.getStats();
console.log('Spent today:', stats.spentToday);
console.log('Remaining:', stats.remainingDailyLimit);
```

## Examples

```bash
cd examples
pnpm install

# Basic usage
npx ts-node basic-usage.ts

# AI trading bot
npx ts-node ai-trading-bot.ts

# Multi-agent system
npx ts-node multi-agent-orchestration.ts
```

## Next Steps

- Read [SDK Documentation](./sdk.md) for complete API
- Review [Security Model](./security.md) before production use
- Check [Examples](../examples) for more use cases
- See [Architecture](./architecture.md) for system design
