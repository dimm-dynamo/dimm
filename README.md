# DIMM - Dynamic Intelligence Multi-Modal

Solana interface for AI agents using compressed NFT SubAccounts. Agents can interact with the blockchain without exposing private keys through delegated permissions and spending limits.

**Idea from:** [Metaplex Foundation](https://github.com/metaplex-foundation) - Built using mpl-bubblegum and SPL Account Compression

**Donation:** `5rcfn1B3WcHVdjfMmrnD2ZmGhLR9fevd5WH1YZtgGrwJ`  
## Key Features

- Zero private key exposure for AI agents
- cNFT merkle tree architecture for scalable SubAccount management
- On-demand SOL allocation from main wallet
- Granular permission system with spending limits
- Built with Rust/Anchor and TypeScript SDK

## Architecture

```
AI Agents (GPT-4, Claude, etc.)
    ↓
DIMM TypeScript SDK
    ↓
DIMM Solana Program (Rust/Anchor)
    ↓
SPL Account Compression (cNFT Merkle Tree)
    ↓
Solana Blockchain
```

## Installation

```bash
# Clone repository
git clone https://github.com/yourusername/dimm.git
cd dimm

# Build program
anchor build
anchor deploy

# Build SDK
cd sdk
pnpm install
pnpm build
```

## Usage

### Basic Example

```typescript
import { DimmClient, AgentPermission } from '@dimm/sdk';
import { Connection, Keypair } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com');
const wallet = Keypair.fromSecretKey(/* your wallet */);
const dimm = new DimmClient(connection, wallet);

// Create agent
const agent = await dimm.createAgent({
  name: 'TradingBot',
  permissions: [AgentPermission.TRANSFER_SOL, AgentPermission.SWAP_TOKENS],
  maxSolPerTransaction: 0.1,
  dailyLimit: 1.0,
});

// Fund agent
await agent.fund(0.5);

// Execute transaction
await agent.transferSol(recipientAddress, 0.01);

// Check stats
const stats = agent.getStats();
console.log('Spent today:', stats.spentToday);
```

### AI Trading Bot Example

```typescript
import { DimmClient, AgentPermission, ActivityType } from '@dimm/sdk';

class TradingBot {
  private agent: Agent;

  async initialize() {
    const dimm = new DimmClient(connection, wallet);
    this.agent = await dimm.createAgent({
      name: 'AI-Trader',
      permissions: [AgentPermission.SWAP_TOKENS],
      maxSolPerTransaction: 0.5,
      dailyLimit: 5.0,
    });
    await this.agent.fund(2.0);
  }

  async executeTrade(analysis: AIAnalysis) {
    if (!this.agent.canSpend(analysis.amount)) {
      console.log('Daily limit exceeded');
      return;
    }

    await this.agent.executeTransaction({
      activityType: ActivityType.SWAP,
      amount: analysis.amount,
      destination: dexProgram,
    });
  }
}
```

### Multi-Agent System Example

```typescript
// Create specialized agents
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

const staker = await dimm.createAgent({
  name: 'Staker',
  permissions: [AgentPermission.STAKING],
  maxSolPerTransaction: 2.0,
  dailyLimit: 20.0,
});

// Fund all agents
await trader.fund(2.0);
await nftManager.fund(5.0);
await staker.fund(10.0);

// Execute coordinated strategy
await trader.executeTransaction({...});
await nftManager.executeTransaction({...});
await staker.executeTransaction({...});
```

## API Reference

See [SDK Documentation](./docs/sdk.md) for complete API reference.

## Examples

Full examples available in `/examples` directory:
- `basic-usage.ts` - Basic agent creation and usage
- `ai-trading-bot.ts` - AI-powered trading bot
- `multi-agent-orchestration.ts` - Multi-agent system

## Documentation

- [Quick Start](./docs/quickstart.md)
- [Architecture](./docs/architecture.md)
- [Security Model](./docs/security.md)
- [SDK Reference](./docs/sdk.md)
- [cNFT Integration](./docs/cnft.md)
- [Program Details](./docs/program.md)

## Testing

```bash
anchor test              # Program tests
cd sdk && pnpm test     # SDK tests
```

## Security

- Agents use SubAccounts (PDAs), never hold private keys
- Transaction and daily spending limits enforced on-chain
- Permission-based access control
- Complete audit trail
- Instant revocation capability

See [SECURITY.md](./SECURITY.md) for details.

## License

MIT License - see [LICENSE](./LICENSE)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

