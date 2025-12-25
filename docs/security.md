# Security Model

## Overview

DIMM's security model is designed around the principle of **zero private key exposure** for AI agents. This document outlines the security mechanisms, threat model, and best practices.

## Core Security Principles

### 1. Private Key Isolation

**Problem**: AI agents need blockchain access but shouldn't hold private keys.

**Solution**: SubAccount architecture with delegated permissions.

- Main wallet holds the master private key
- Agents operate through SubAccounts (PDAs)
- Agents can only execute pre-authorized operations
- Main wallet can revoke agent access instantly

### 2. Permission-Based Access Control

Each agent has explicit permissions:

```typescript
enum AgentPermission {
  TRANSFER_SOL,      // Send SOL to addresses
  SWAP_TOKENS,       // Execute DEX swaps
  NFT_OPERATIONS,    // Buy/sell NFTs
  STAKING,          // Stake tokens
  GOVERNANCE,       // Vote on proposals
  DEFI_PROTOCOLS,   // Interact with DeFi
  TOKEN_ACCOUNTS,   // Manage token accounts
  EXECUTE_PROGRAMS, // Call arbitrary programs
}
```

**Security Notes**:
- `EXECUTE_PROGRAMS` is the most permissive - use with extreme caution
- Permissions are additive - grant minimum required
- Permissions can be updated without recreating agent

### 3. Spending Limits

Two-tier limit system:

```typescript
{
  maxSolPerTransaction: 0.1,  // Per-tx limit
  dailyLimit: 1.0,            // 24-hour limit
}
```

**Enforcement**:
- Validated on-chain before execution
- Cannot be bypassed by agent
- Automatically reset after 24 hours
- Main wallet can adjust anytime

### 4. Audit Trail

All agent actions are logged on-chain:

```rust
pub struct AgentActivity {
    agent: Pubkey,
    activity_type: ActivityType,
    amount: u64,
    destination: Option<Pubkey>,
    reason: String,
    timestamp: i64,
    signature: [u8; 64],
    success: bool,
}
```

**Benefits**:
- Immutable record of all operations
- Forensic analysis capability
- Compliance and reporting
- Anomaly detection

## Threat Model

### Threats We Protect Against

#### 1. Compromised AI Agent

**Scenario**: Attacker gains control of AI agent's logic or API keys.

**Mitigations**:
- Agent has no access to private keys
- Spending limits prevent large losses
- Permissions restrict attack surface
- Main wallet can revoke instantly

#### 2. Malicious Instructions

**Scenario**: Attacker tricks AI into executing harmful transactions.

**Mitigations**:
- Whitelist approach (only allowed operations)
- Amount limits on all transactions
- Daily spending caps
- Activity monitoring and alerts

#### 3. Resource Exhaustion

**Scenario**: Agent depletes wallet funds through many small transactions.

**Mitigations**:
- Daily spending limits
- Per-transaction limits
- Minimum balance requirements
- Rate limiting (can be added)

#### 4. Permission Escalation

**Scenario**: Agent attempts to gain higher privileges.

**Mitigations**:
- Permissions stored on-chain
- Only main wallet can modify
- PDA-based access control
- Signature verification

### Threats to Be Aware Of

#### 1. Main Wallet Compromise

If the main wallet's private key is stolen, attacker has full control. This is equivalent to any Solana wallet compromise.

**Best Practices**:
- Use hardware wallet for main wallet
- Multi-signature wallet for high-value accounts
- Regular security audits
- Monitor main wallet activity

#### 2. Smart Contract Vulnerabilities

Bugs in the DIMM program could be exploited.

**Mitigations**:
- Professional security audit (recommended before mainnet)
- Extensive testing
- Gradual rollout
- Bug bounty program

#### 3. AI Behavior Manipulation

Sophisticated attacks on the AI itself.

**Best Practices**:
- Implement AI safety measures
- Use multiple AI models for cross-validation
- Human-in-the-loop for high-value transactions
- Anomaly detection

## Best Practices

### For Main Wallet Owners

1. **Start Conservative**
   ```typescript
   // Begin with minimal permissions
   const agent = await dimm.createAgent({
     name: 'MyAgent',
     permissions: [AgentPermission.TRANSFER_SOL],
     maxSolPerTransaction: 0.01,  // Start small
     dailyLimit: 0.1,
   });
   ```

2. **Monitor Regularly**
   ```typescript
   // Check agent activity
   const stats = agent.getStats();
   console.log('Spent today:', stats.spentToday);
   console.log('Total transactions:', stats.totalTransactions);
   ```

3. **Revoke When Suspicious**
   ```typescript
   // Instant revocation
   await agent.revoke();
   ```

4. **Use Hardware Wallets**
   - Ledger or Trezor for main wallet
   - Require physical confirmation for sensitive operations

### For AI Agent Developers

1. **Validate Before Executing**
   ```typescript
   // Check if agent can afford operation
   if (!agent.canSpend(amount)) {
     throw new Error('Insufficient daily limit');
   }
   ```

2. **Implement Rate Limiting**
   ```typescript
   // Limit transaction frequency
   const minTimeBetweenTx = 60_000; // 1 minute
   await sleep(minTimeBetweenTx);
   ```

3. **Log Everything**
   ```typescript
   // Detailed logging
   console.log({
     timestamp: new Date(),
     action: 'transfer',
     amount,
     destination,
     reason,
   });
   ```

4. **Graceful Degradation**
   ```typescript
   // Handle failures gracefully
   try {
     await agent.transferSol(dest, amount);
   } catch (error) {
     // Don't expose sensitive info
     logger.error('Transaction failed', { error: error.message });
     // Notify operator
     await notifyAdmin('Agent transaction failed');
   }
   ```

### For Production Deployments

1. **Multi-Signature for High Value**
   - Use multi-sig wallet as main wallet
   - Require multiple approvals for agent creation
   - Implement spending thresholds

2. **Monitoring and Alerts**
   ```typescript
   // Set up monitoring
   setInterval(async () => {
     const stats = await agent.getStats();
     if (stats.spentToday > stats.dailyLimit * 0.9) {
       await sendAlert('Agent approaching daily limit');
     }
   }, 60_000);
   ```

3. **Gradual Rollout**
   - Test on devnet thoroughly
   - Start with small limits on mainnet
   - Gradually increase as confidence builds

4. **Emergency Procedures**
   ```typescript
   // Emergency shutdown
   async function emergencyShutdown() {
     const agents = await dimm.listAgents();
     for (const agent of agents) {
       await agent.revoke();
       await agent.withdraw(await agent.getBalance());
     }
   }
   ```

## Security Checklist

Before deploying to mainnet:

- [ ] Smart contract security audit completed
- [ ] Main wallet uses hardware device
- [ ] Multi-signature enabled for high-value accounts
- [ ] Monitoring and alerting configured
- [ ] Emergency procedures documented
- [ ] Agent permissions are minimal
- [ ] Spending limits are conservative
- [ ] Backup and recovery plan in place
- [ ] Team trained on security procedures
- [ ] Incident response plan ready

## Reporting Vulnerabilities

If you discover a security vulnerability, please:

1. **DO NOT** open a public issue
2. Email security@dimm.ai with details
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We aim to respond within 24 hours and will work with you to address the issue responsibly.

## Security Roadmap

Future security enhancements:

- [ ] Formal verification of smart contracts
- [ ] Multi-signature agent operations
- [ ] Timelock for permission changes
- [ ] On-chain circuit breakers
- [ ] Insurance fund for protocol
- [ ] Decentralized monitoring network
- [ ] Zero-knowledge proofs for privacy
- [ ] Quantum-resistant signatures

## Disclaimer

DIMM is experimental software. Use at your own risk. While we've implemented multiple security layers, no system is 100% secure. Always start with small amounts and test thoroughly before production use.


