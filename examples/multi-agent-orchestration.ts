/**
 * Multi-Agent Orchestration Example
 * 
 * This example demonstrates managing multiple AI agents with different
 * roles and permissions, coordinated by a central orchestrator.
 */

import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { DimmClient, AgentPermission } from '@dimm/sdk';

interface AgentRole {
  name: string;
  description: string;
  permissions: AgentPermission[];
  maxPerTx: number;
  dailyLimit: number;
}

const AGENT_ROLES: Record<string, AgentRole> = {
  trader: {
    name: 'Trader',
    description: 'Executes trades on DEXs',
    permissions: [AgentPermission.SWAP_TOKENS, AgentPermission.TOKEN_ACCOUNTS],
    maxPerTx: 0.5,
    dailyLimit: 5.0,
  },
  nftManager: {
    name: 'NFT Manager',
    description: 'Manages NFT portfolio',
    permissions: [AgentPermission.NFT_OPERATIONS],
    maxPerTx: 1.0,
    dailyLimit: 10.0,
  },
  staker: {
    name: 'Staker',
    description: 'Manages staking positions',
    permissions: [AgentPermission.STAKING],
    maxPerTx: 2.0,
    dailyLimit: 20.0,
  },
  governor: {
    name: 'Governor',
    description: 'Participates in DAO governance',
    permissions: [AgentPermission.GOVERNANCE],
    maxPerTx: 0.1,
    dailyLimit: 1.0,
  },
  treasurer: {
    name: 'Treasurer',
    description: 'Manages fund distribution',
    permissions: [AgentPermission.TRANSFER_SOL],
    maxPerTx: 0.2,
    dailyLimit: 2.0,
  },
};

class AgentOrchestrator {
  private dimm: DimmClient;
  private agents: Map<string, any> = new Map();

  constructor(
    connection: Connection,
    wallet: Keypair
  ) {
    this.dimm = new DimmClient(connection, wallet);
  }

  async initialize() {
    console.log('🎭 Initializing Multi-Agent System...\n');

    // Create agents for each role
    for (const [roleId, role] of Object.entries(AGENT_ROLES)) {
      console.log(`Creating ${role.name}...`);
      
      const agent = await this.dimm.createAgent({
        name: `${role.name}-${Date.now()}`,
        permissions: role.permissions,
        maxSolPerTransaction: role.maxPerTx,
        dailyLimit: role.dailyLimit,
      });

      this.agents.set(roleId, agent);
      console.log(`✅ ${role.name} created:`, agent.address.toString());
      console.log(`   Permissions:`, role.permissions.join(', '));
      console.log(`   Max per tx: ${role.maxPerTx} SOL`);
      console.log(`   Daily limit: ${role.dailyLimit} SOL\n`);

      // Fund the agent
      await agent.fund(role.dailyLimit * 0.3);
    }

    console.log(`\n🎉 All ${this.agents.size} agents initialized!\n`);
  }

  async executeTask(taskType: string, params: any) {
    console.log(`\n📋 Executing task: ${taskType}`);

    switch (taskType) {
      case 'swap':
        return this.delegateToTrader(params);
      
      case 'buyNFT':
        return this.delegateToNFTManager(params);
      
      case 'stake':
        return this.delegateToStaker(params);
      
      case 'vote':
        return this.delegateToGovernor(params);
      
      case 'distribute':
        return this.delegateToTreasurer(params);
      
      default:
        throw new Error(`Unknown task type: ${taskType}`);
    }
  }

  private async delegateToTrader(params: any) {
    const trader = this.agents.get('trader');
    console.log('🤖 Trader agent handling swap...');
    
    // Check if trader can execute
    if (!trader.canSpend(params.amount)) {
      console.log('⚠️  Trader daily limit exceeded');
      return { success: false, reason: 'Daily limit exceeded' };
    }

    // Execute swap
    const result = await trader.executeTransaction({
      activityType: 'Swap',
      amount: params.amount,
      destination: params.dexProgram,
    });

    console.log(result.success ? '✅ Swap completed' : '❌ Swap failed');
    return result;
  }

  private async delegateToNFTManager(params: any) {
    const nftManager = this.agents.get('nftManager');
    console.log('🖼️  NFT Manager handling purchase...');

    if (!nftManager.canSpend(params.price)) {
      console.log('⚠️  NFT Manager daily limit exceeded');
      
      // Request additional funds from main wallet
      console.log('💰 Requesting additional funds...');
      await nftManager.fund(params.price);
    }

    const result = await nftManager.executeTransaction({
      activityType: 'NftOperation',
      amount: params.price,
      destination: params.marketplace,
    });

    console.log(result.success ? '✅ NFT purchased' : '❌ Purchase failed');
    return result;
  }

  private async delegateToStaker(params: any) {
    const staker = this.agents.get('staker');
    console.log('📈 Staker agent handling stake...');

    const result = await staker.executeTransaction({
      activityType: 'Staking',
      amount: params.amount,
      destination: params.validator,
    });

    console.log(result.success ? '✅ Stake successful' : '❌ Stake failed');
    return result;
  }

  private async delegateToGovernor(params: any) {
    const governor = this.agents.get('governor');
    console.log('🗳️  Governor agent voting...');

    const result = await governor.executeTransaction({
      activityType: 'Governance',
      amount: 0, // Voting usually doesn't require SOL transfer
      destination: params.proposal,
    });

    console.log(result.success ? '✅ Vote cast' : '❌ Vote failed');
    return result;
  }

  private async delegateToTreasurer(params: any) {
    const treasurer = this.agents.get('treasurer');
    console.log('💼 Treasurer distributing funds...');

    const result = await treasurer.transferSol(
      params.recipient,
      params.amount
    );

    console.log(result.success ? '✅ Funds distributed' : '❌ Distribution failed');
    return result;
  }

  async getSystemStatus() {
    console.log('\n📊 System Status Report\n');
    console.log('='.repeat(60));

    for (const [roleId, agent] of this.agents.entries()) {
      const role = AGENT_ROLES[roleId];
      const stats = agent.getStats();
      const balance = await agent.getBalance();

      console.log(`\n${role.name} (${roleId})`);
      console.log('-'.repeat(40));
      console.log(`Address: ${agent.address.toString()}`);
      console.log(`Balance: ${balance.toFixed(4)} SOL`);
      console.log(`Spent Today: ${stats.spentToday.toFixed(4)} SOL`);
      console.log(`Daily Limit: ${stats.remainingDailyLimit.toFixed(4)} SOL remaining`);
      console.log(`Total Transactions: ${stats.totalTransactions}`);
      console.log(`Total Volume: ${stats.totalSpent.toFixed(4)} SOL`);
      console.log(`Status: ${agent.isActive() ? '🟢 Active' : '🔴 Revoked'}`);
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }

  async rebalanceAgents() {
    console.log('\n⚖️  Rebalancing agent funds...\n');

    for (const [roleId, agent] of this.agents.entries()) {
      const role = AGENT_ROLES[roleId];
      const balance = await agent.getBalance();
      const targetBalance = role.dailyLimit * 0.3;

      if (balance < targetBalance * 0.5) {
        const needed = targetBalance - balance;
        console.log(`${role.name}: Low balance, adding ${needed.toFixed(4)} SOL`);
        await agent.fund(needed);
      } else if (balance > targetBalance * 2) {
        const excess = balance - targetBalance;
        console.log(`${role.name}: Excess balance, withdrawing ${excess.toFixed(4)} SOL`);
        await agent.withdraw(excess);
      } else {
        console.log(`${role.name}: Balance OK (${balance.toFixed(4)} SOL)`);
      }
    }

    console.log('\n✅ Rebalancing complete\n');
  }

  async emergencyShutdown() {
    console.log('\n🚨 EMERGENCY SHUTDOWN INITIATED\n');

    for (const [roleId, agent] of this.agents.entries()) {
      const role = AGENT_ROLES[roleId];
      
      console.log(`Revoking ${role.name}...`);
      await agent.revoke();

      console.log(`Withdrawing funds from ${role.name}...`);
      const balance = await agent.getBalance();
      if (balance > 0.005) {
        await agent.withdraw(balance - 0.005);
      }

      console.log(`✅ ${role.name} shutdown complete`);
    }

    console.log('\n🛑 All agents revoked and funds recovered\n');
  }
}

// Demo scenarios
async function main() {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const wallet = Keypair.generate(); // In production, load from secure storage

  const orchestrator = new AgentOrchestrator(connection, wallet);

  // Initialize all agents
  await orchestrator.initialize();

  // Show initial status
  await orchestrator.getSystemStatus();

  // Execute various tasks
  console.log('\n🎬 Running Demo Scenarios...\n');

  // Scenario 1: Execute a swap
  await orchestrator.executeTask('swap', {
    amount: 0.1,
    dexProgram: Keypair.generate().publicKey,
  });

  // Scenario 2: Buy an NFT
  await orchestrator.executeTask('buyNFT', {
    price: 0.5,
    marketplace: Keypair.generate().publicKey,
  });

  // Scenario 3: Stake SOL
  await orchestrator.executeTask('stake', {
    amount: 1.0,
    validator: Keypair.generate().publicKey,
  });

  // Scenario 4: Vote on proposal
  await orchestrator.executeTask('vote', {
    proposal: Keypair.generate().publicKey,
  });

  // Scenario 5: Distribute funds
  await orchestrator.executeTask('distribute', {
    recipient: Keypair.generate().publicKey,
    amount: 0.05,
  });

  // Rebalance agents
  await orchestrator.rebalanceAgents();

  // Final status
  await orchestrator.getSystemStatus();

  // Uncomment to test emergency shutdown
  // await orchestrator.emergencyShutdown();

  console.log('✅ Demo complete!\n');
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { AgentOrchestrator, AGENT_ROLES };


