# DIMM Setup Guide

**Idea from:** [Metaplex Foundation](https://github.com/metaplex-foundation)  
**Donation:** `5rcfn1B3WcHVdjfMmrnD2ZmGhLR9fevd5WH1YZtgGrwJ`

## Prerequisites

```powershell
# Check versions
rustc --version    # 1.70.0+
solana --version   # 1.18.0+
anchor --version   # 0.29.0+
node --version     # 18.0.0+
```

Install from:
- Rust: https://rustup.rs/
- Solana: https://docs.solana.com/cli/install-solana-cli-tools
- Anchor: https://www.anchor-lang.com/docs/installation
- Node.js: https://nodejs.org/
- pnpm: `npm install -g pnpm`

## Build

```powershell
cd c:\Personal\1_Build\1_SOL\dimm

# Build program
anchor build

# Configure
solana config set --url devnet
solana airdrop 2

# Deploy
anchor deploy
```

## Update Program ID

After deployment, update in:

**Anchor.toml**
```toml
[programs.devnet]
dimm = "YOUR_PROGRAM_ID"
```

**sdk/src/constants.ts**
```typescript
export const DIMM_PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID');
```

## Build SDK

```powershell
cd sdk
pnpm install
pnpm build
```

## Run Examples

```powershell
cd ..\examples
pnpm install
npx ts-node basic-usage.ts
```

## Usage

```typescript
import { DimmClient, AgentPermission } from '@dimm/sdk';
import { Connection, Keypair } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com');
const wallet = Keypair.fromSecretKey(/* your wallet */);
const dimm = new DimmClient(connection, wallet);

// Create agent
const agent = await dimm.createAgent({
  name: 'MyAgent',
  permissions: [AgentPermission.TRANSFER_SOL],
  maxSolPerTransaction: 0.1,
  dailyLimit: 1.0,
});

// Use agent
await agent.fund(0.5);
await agent.transferSol(recipient, 0.01);
console.log(agent.getStats());
```

## Testing

```powershell
anchor test         # Program tests
cd sdk && pnpm test # SDK tests
```

## Common Issues

**"Program not deployed"**
```powershell
anchor deploy
```

**"Insufficient funds"**
```powershell
solana airdrop 2
```

**"Module not found"**
```powershell
cd sdk && pnpm install && pnpm build
```

## Next Steps

- See `docs/quickstart.md` for detailed guide
- Check `examples/` for more use cases
- Review `docs/sdk.md` for API reference
