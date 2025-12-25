# DIMM Project Overview

Solana interface for AI agents using compressed NFT SubAccounts.

**Idea from:** [Metaplex Foundation](https://github.com/metaplex-foundation) - Using mpl-bubblegum and SPL Account Compression  
**Donation:** `5rcfn1B3WcHVdjfMmrnD2ZmGhLR9fevd5WH1YZtgGrwJ`

## Structure

```
dimm/
├── programs/dimm/          # Solana program (Rust/Anchor)
│   ├── src/lib.rs
│   ├── src/state/         # Account structures
│   └── src/instructions/  # Handlers
├── sdk/                   # TypeScript SDK
│   └── src/
├── examples/              # Example implementations
│   ├── basic-usage.ts
│   ├── ai-trading-bot.ts
│   └── multi-agent-orchestration.ts
├── docs/                  # Documentation
└── tests/                 # Tests
```

## Quick Start

```bash
anchor build
anchor deploy
cd sdk && pnpm install && pnpm build
cd ../examples && pnpm install
npx ts-node basic-usage.ts
```

## Usage

```typescript
import { DimmClient, AgentPermission } from '@dimm/sdk';

const dimm = new DimmClient(connection, wallet);

const agent = await dimm.createAgent({
  name: 'TradingBot',
  permissions: [AgentPermission.SWAP_TOKENS],
  maxSolPerTransaction: 0.5,
  dailyLimit: 5.0,
});

await agent.fund(2.0);
await agent.executeTransaction({
  activityType: ActivityType.SWAP,
  amount: 0.1,
  destination: dexProgram,
});
```

## Features

- Zero private key exposure for AI agents
- cNFT-based SubAccount management (up to 10,000 agents)
- Per-transaction and daily spending limits
- 8 permission types
- Complete on-chain audit trail
- Instant revocation

## Examples

### AI Trading Bot

```typescript
class TradingBot {
  async executeTrade(analysis: AIAnalysis) {
    if (!this.agent.canSpend(analysis.amount)) return;
    
    await this.agent.executeTransaction({
      activityType: ActivityType.SWAP,
      amount: analysis.amount,
      destination: dexProgram,
    });
  }
}
```

### Multi-Agent System

```typescript
const trader = await dimm.createAgent({
  name: 'Trader',
  permissions: [AgentPermission.SWAP_TOKENS],
  maxSolPerTransaction: 0.5,
  dailyLimit: 5.0,
});

const nftManager = await dimm.createAgent({
  name: 'NFT-Manager',
  permissions: [AgentPermission.NFT_OPERATIONS],
  maxSolPerTransaction: 1.0,
  dailyLimit: 10.0,
});
```

## Cost Analysis

1000 agents:
- Traditional NFTs: ~15 SOL
- DIMM (cNFTs): ~2 SOL
- Savings: 87%

## Documentation

- [Quick Start](./docs/quickstart.md)
- [SDK Reference](./docs/sdk.md)
- [Architecture](./docs/architecture.md)
- [Security](./docs/security.md)
- [cNFT Integration](./docs/cnft.md)

## Testing

```bash
anchor test
cd sdk && pnpm test
```

## License

MIT
