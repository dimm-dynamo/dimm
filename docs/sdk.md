# DIMM SDK Documentation

## Installation

```bash
npm install @dimm/sdk
# or
pnpm add @dimm/sdk
# or
yarn add @dimm/sdk
```

## Quick Start

```typescript
import { Connection, Keypair } from '@solana/web3.js';
import { DimmClient, AgentPermission } from '@dimm/sdk';

// Initialize client
const connection = new Connection('https://api.devnet.solana.com');
const wallet = Keypair.generate();
const dimm = new DimmClient(connection, wallet);

// Create an agent
const agent = await dimm.createAgent({
  name: 'MyAgent',
  permissions: [AgentPermission.TRANSFER_SOL],
  maxSolPerTransaction: 0.1,
  dailyLimit: 1.0,
});

// Fund the agent
await agent.fund(0.5);

// Execute a transaction
await agent.transferSol(recipientAddress, 0.01);
```

## API Reference

### DimmClient

Main client for interacting with the DIMM protocol.

#### Constructor

```typescript
new DimmClient(
  connection: Connection,
  wallet: Keypair,
  programId?: PublicKey
)
```

**Parameters:**
- `connection`: Solana connection instance
- `wallet`: Main wallet keypair
- `programId`: Optional custom program ID (defaults to mainnet program)

#### Methods

##### `initialize(params?)`

Initialize the DIMM protocol for your wallet.

```typescript
await dimm.initialize({
  maxDepth: 14,
  maxBufferSize: 64,
});
```

**Parameters:**
- `params.maxDepth`: Merkle tree depth (default: 14)
- `params.maxBufferSize`: Merkle tree buffer size (default: 64)

**Returns:** `Promise<TransactionResult>`

##### `createAgent(params)`

Create a new AI agent SubAccount.

```typescript
const agent = await dimm.createAgent({
  name: 'TradingBot',
  permissions: [
    AgentPermission.SWAP_TOKENS,
    AgentPermission.TRANSFER_SOL,
  ],
  maxSolPerTransaction: 0.5,
  dailyLimit: 5.0,
});
```

**Parameters:**
- `params.name`: Agent name (max 32 characters)
- `params.permissions`: Array of permissions
- `params.maxSolPerTransaction`: Max SOL per transaction
- `params.dailyLimit`: Max SOL per day

**Returns:** `Promise<Agent>`

##### `getAgent(agentId)`

Fetch an agent by ID.

```typescript
const agent = await dimm.getAgent(new BN(0));
```

**Parameters:**
- `agentId`: Agent ID (BN)

**Returns:** `Promise<Agent | null>`

##### `listAgents()`

List all agents for the main wallet.

```typescript
const agents = await dimm.listAgents();
for (const agent of agents) {
  console.log(agent.data.name);
}
```

**Returns:** `Promise<Agent[]>`

##### `fundAgent(agentAddress, amount)`

Fund an agent from the main wallet.

```typescript
await dimm.fundAgent(agentAddress, 1.0); // 1 SOL
```

**Parameters:**
- `agentAddress`: Agent's public key
- `amount`: Amount in SOL

**Returns:** `Promise<TransactionResult>`

##### `executeTransaction(agentAddress, params)`

Execute a transaction through an agent.

```typescript
await dimm.executeTransaction(agentAddress, {
  activityType: ActivityType.TRANSFER,
  amount: 0.1,
  destination: recipientAddress,
});
```

**Parameters:**
- `agentAddress`: Agent's public key
- `params.activityType`: Type of activity
- `params.amount`: Amount in SOL
- `params.destination`: Destination address (optional)
- `params.instructionData`: Additional instruction data (optional)

**Returns:** `Promise<TransactionResult>`

##### `updatePermissions(agentAddress, permissions)`

Update an agent's permissions.

```typescript
await dimm.updatePermissions(agentAddress, [
  AgentPermission.TRANSFER_SOL,
  AgentPermission.SWAP_TOKENS,
  AgentPermission.NFT_OPERATIONS,
]);
```

**Parameters:**
- `agentAddress`: Agent's public key
- `permissions`: Array of permission strings

**Returns:** `Promise<TransactionResult>`

##### `updateLimits(agentAddress, params)`

Update an agent's spending limits.

```typescript
await dimm.updateLimits(agentAddress, {
  maxSolPerTransaction: 1.0,
  dailyLimit: 10.0,
});
```

**Parameters:**
- `agentAddress`: Agent's public key
- `params.maxSolPerTransaction`: New per-tx limit (optional)
- `params.dailyLimit`: New daily limit (optional)

**Returns:** `Promise<TransactionResult>`

##### `revokeAgent(agentAddress)`

Revoke an agent's access.

```typescript
await dimm.revokeAgent(agentAddress);
```

**Parameters:**
- `agentAddress`: Agent's public key

**Returns:** `Promise<TransactionResult>`

##### `withdrawFromAgent(agentAddress, amount)`

Withdraw funds from agent to main wallet.

```typescript
await dimm.withdrawFromAgent(agentAddress, 0.5);
```

**Parameters:**
- `agentAddress`: Agent's public key
- `amount`: Amount in SOL

**Returns:** `Promise<TransactionResult>`

### Agent

Represents an AI agent SubAccount.

#### Properties

- `address: PublicKey` - Agent's address
- `data: AgentAccount` - Agent's account data

#### Methods

##### `reload()`

Reload agent data from blockchain.

```typescript
await agent.reload();
```

##### `getStats()`

Get agent statistics.

```typescript
const stats = agent.getStats();
console.log(stats.totalSpent);      // Total SOL spent
console.log(stats.spentToday);      // SOL spent today
console.log(stats.totalTransactions); // Transaction count
console.log(stats.remainingDailyLimit); // Remaining daily budget
```

**Returns:** `AgentStats`

##### `canSpend(amount)`

Check if agent can spend an amount.

```typescript
if (agent.canSpend(0.5)) {
  // Proceed with transaction
}
```

**Parameters:**
- `amount`: Amount in SOL

**Returns:** `boolean`

##### `transferSol(destination, amount)`

Transfer SOL to an address.

```typescript
await agent.transferSol(recipientAddress, 0.1);
```

**Parameters:**
- `destination`: Recipient's public key
- `amount`: Amount in SOL

**Returns:** `Promise<TransactionResult>`

##### `executeTransaction(params)`

Execute a generic transaction.

```typescript
await agent.executeTransaction({
  activityType: ActivityType.SWAP,
  amount: 0.5,
  destination: dexProgramId,
});
```

**Parameters:**
- `params`: ExecuteTransactionParams

**Returns:** `Promise<TransactionResult>`

##### `getBalance()`

Get agent's SOL balance.

```typescript
const balance = await agent.getBalance();
console.log(`Agent has ${balance} SOL`);
```

**Returns:** `Promise<number>`

##### `updateLimits(params)`

Update agent's spending limits.

```typescript
await agent.updateLimits({
  maxSolPerTransaction: 2.0,
  dailyLimit: 20.0,
});
```

**Parameters:**
- `params.maxSolPerTransaction`: New per-tx limit (optional)
- `params.dailyLimit`: New daily limit (optional)

**Returns:** `Promise<TransactionResult>`

##### `updatePermissions(permissions)`

Update agent's permissions.

```typescript
await agent.updatePermissions([
  AgentPermission.TRANSFER_SOL,
  AgentPermission.STAKING,
]);
```

**Parameters:**
- `permissions`: Array of permission strings

**Returns:** `Promise<TransactionResult>`

##### `revoke()`

Revoke this agent.

```typescript
await agent.revoke();
```

**Returns:** `Promise<TransactionResult>`

##### `fund(amount)`

Fund this agent from main wallet.

```typescript
await agent.fund(1.0);
```

**Parameters:**
- `amount`: Amount in SOL

**Returns:** `Promise<TransactionResult>`

##### `withdraw(amount)`

Withdraw from this agent to main wallet.

```typescript
await agent.withdraw(0.5);
```

**Parameters:**
- `amount`: Amount in SOL

**Returns:** `Promise<TransactionResult>`

##### `isActive()`

Check if agent is active (not revoked).

```typescript
if (agent.isActive()) {
  // Agent can execute transactions
}
```

**Returns:** `boolean`

##### `getInfo()`

Get comprehensive agent information.

```typescript
const info = agent.getInfo();
console.log(info);
// {
//   address: "...",
//   name: "MyAgent",
//   agentId: "0",
//   permissions: [...],
//   maxSolPerTransaction: 0.1,
//   dailyLimit: 1.0,
//   revoked: false,
//   stats: {...}
// }
```

**Returns:** Agent information object

## Types

### AgentPermission

```typescript
enum AgentPermission {
  TRANSFER_SOL = 'TransferSol',
  SWAP_TOKENS = 'SwapTokens',
  NFT_OPERATIONS = 'NftOperations',
  STAKING = 'Staking',
  GOVERNANCE = 'Governance',
  DEFI_PROTOCOLS = 'DefiProtocols',
  TOKEN_ACCOUNTS = 'TokenAccounts',
  EXECUTE_PROGRAMS = 'ExecutePrograms',
}
```

### ActivityType

```typescript
enum ActivityType {
  TRANSFER = 'Transfer',
  SWAP = 'Swap',
  NFT_OPERATION = 'NftOperation',
  STAKING = 'Staking',
  GOVERNANCE = 'Governance',
  DEFI_INTERACTION = 'DefiInteraction',
  FUNDING = 'Funding',
  WITHDRAWAL = 'Withdrawal',
  OTHER = 'Other',
}
```

### AgentStats

```typescript
interface AgentStats {
  totalSpent: number;         // Total SOL spent
  spentToday: number;         // SOL spent today
  totalTransactions: number;  // Total transaction count
  remainingDailyLimit: number; // Remaining daily budget
  createdAt: Date;            // Creation timestamp
  lastUsedAt: Date;           // Last usage timestamp
}
```

### TransactionResult

```typescript
interface TransactionResult {
  signature: string;  // Transaction signature
  success: boolean;   // Whether transaction succeeded
  error?: string;     // Error message if failed
}
```

## Utility Functions

### `solToLamports(sol)`

Convert SOL to lamports.

```typescript
import { solToLamports } from '@dimm/sdk';

const lamports = solToLamports(1.5); // BN(1500000000)
```

### `lamportsToSol(lamports)`

Convert lamports to SOL.

```typescript
import { lamportsToSol } from '@dimm/sdk';

const sol = lamportsToSol(new BN(1500000000)); // 1.5
```

### `getProtocolConfigPDA(authority, programId?)`

Get protocol config PDA.

```typescript
import { getProtocolConfigPDA } from '@dimm/sdk';

const [pda, bump] = await getProtocolConfigPDA(walletPublicKey);
```

### `getAgentAccountPDA(mainWallet, agentId, programId?)`

Get agent account PDA.

```typescript
import { getAgentAccountPDA } from '@dimm/sdk';

const [pda, bump] = await getAgentAccountPDA(
  walletPublicKey,
  new BN(0)
);
```

## Error Handling

```typescript
try {
  await agent.transferSol(destination, 100); // Too much!
} catch (error) {
  if (error.message.includes('ExceedsDailyLimit')) {
    console.log('Daily limit exceeded');
  } else if (error.message.includes('InsufficientBalance')) {
    console.log('Agent has insufficient balance');
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Examples

See the `/examples` directory for complete examples:

- `basic-usage.ts` - Basic agent creation and usage
- `ai-trading-bot.ts` - AI-powered trading bot
- `multi-agent-orchestration.ts` - Managing multiple agents

## Support

- GitHub Issues: https://github.com/yourusername/dimm/issues
- Discord: https://discord.gg/dimm (coming soon)
- Email: support@dimm.ai

