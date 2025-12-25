# DIMM TypeScript SDK

TypeScript SDK for DIMM protocol on Solana.

**Idea from:** [Metaplex Foundation](https://github.com/metaplex-foundation)

## Installation

```bash
npm install @dimm/sdk
```

## Usage

```typescript
import { Connection, Keypair } from '@solana/web3.js';
import { DimmClient, AgentPermission } from '@dimm/sdk';

const connection = new Connection('https://api.devnet.solana.com');
const wallet = Keypair.generate();
const dimm = new DimmClient(connection, wallet);

// Create agent
const agent = await dimm.createAgent({
  name: 'MyAgent',
  permissions: [AgentPermission.TRANSFER_SOL],
  maxSolPerTransaction: 0.1,
  dailyLimit: 1.0,
});

// Fund and use
await agent.fund(0.5);
await agent.transferSol(destination, 0.01);
```

## API

### DimmClient

```typescript
const dimm = new DimmClient(connection, wallet, programId?);

await dimm.createAgent(params);
await dimm.getAgent(agentId);
await dimm.listAgents();
```

### Agent

```typescript
await agent.fund(amount);
await agent.transferSol(destination, amount);
await agent.executeTransaction(params);
await agent.getBalance();
await agent.updateLimits(params);
await agent.updatePermissions(permissions);
await agent.revoke();

const stats = agent.getStats();
const canSpend = agent.canSpend(amount);
const isActive = agent.isActive();
```

## Examples

See [examples directory](../examples):
- `basic-usage.ts`
- `ai-trading-bot.ts`
- `multi-agent-orchestration.ts`

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
```

## License

MIT
