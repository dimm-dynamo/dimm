/**
 * Basic DIMM Usage Example
 * 
 * This example demonstrates:
 * - Connecting to DIMM
 * - Creating an AI agent
 * - Funding the agent
 * - Executing a transaction
 * - Monitoring agent activity
 */

import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { DimmClient, AgentPermission } from '@dimm/sdk';
import * as fs from 'fs';

async function main() {
  // 1. Setup connection and wallet
  console.log('Setting up connection...');
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Load your wallet (replace with your actual wallet path)
  const walletPath = process.env.WALLET_PATH || './wallet.json';
  const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
  const wallet = Keypair.fromSecretKey(new Uint8Array(walletData));
  
  console.log('Wallet:', wallet.publicKey.toString());
  
  // Check wallet balance
  const balance = await connection.getBalance(wallet.publicKey);
  console.log(`Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  
  if (balance === 0) {
    console.log('Please airdrop some SOL to your wallet:');
    console.log(`solana airdrop 2 ${wallet.publicKey.toString()}`);
    return;
  }

  // 2. Initialize DIMM client
  console.log('\nInitializing DIMM client...');
  const dimm = new DimmClient(connection, wallet);

  // 3. Create an AI agent
  console.log('\nCreating AI agent...');
  const agent = await dimm.createAgent({
    name: 'MyFirstAgent',
    permissions: [
      AgentPermission.TRANSFER_SOL,
      AgentPermission.SWAP_TOKENS,
    ],
    maxSolPerTransaction: 0.1,  // Max 0.1 SOL per transaction
    dailyLimit: 1.0,            // Max 1 SOL per day
  });

  console.log('Agent created successfully!');
  console.log('Agent address:', agent.address.toString());
  console.log('Agent info:', agent.getInfo());

  // 4. Fund the agent
  console.log('\nFunding agent with 0.5 SOL...');
  const fundResult = await agent.fund(0.5);
  
  if (fundResult.success) {
    console.log('Agent funded!');
    console.log('Transaction:', fundResult.signature);
  } else {
    console.error('Funding failed:', fundResult.error);
    return;
  }

  // Wait a bit for confirmation
  await sleep(2000);

  // 5. Check agent balance
  const agentBalance = await agent.getBalance();
  console.log('\nAgent balance:', agentBalance, 'SOL');

  // 6. Execute a transaction through the agent
  console.log('\nExecuting transaction...');
  
  // Create a recipient (in real use, this would be a real address)
  const recipient = Keypair.generate().publicKey;
  
  // Check if agent can spend
  if (agent.canSpend(0.01)) {
    const txResult = await agent.transferSol(recipient, 0.01);
    
    if (txResult.success) {
      console.log('Transaction successful!');
      console.log('Signature:', txResult.signature);
    } else {
      console.error('Transaction failed:', txResult.error);
    }
  } else {
    console.log('Agent cannot spend 0.01 SOL (limit exceeded)');
  }

  // 7. Get agent statistics
  console.log('\nAgent statistics:');
  const stats = agent.getStats();
  console.log('- Total spent:', stats.totalSpent, 'SOL');
  console.log('- Spent today:', stats.spentToday, 'SOL');
  console.log('- Remaining daily limit:', stats.remainingDailyLimit, 'SOL');
  console.log('- Total transactions:', stats.totalTransactions);
  console.log('- Created at:', stats.createdAt);
  console.log('- Last used at:', stats.lastUsedAt);

  // 8. Update agent limits (optional)
  console.log('\nUpdating agent limits...');
  await agent.updateLimits({
    maxSolPerTransaction: 0.2,  // Increase to 0.2 SOL
    dailyLimit: 2.0,            // Increase to 2 SOL
  });
  console.log('Limits updated!');

  // 9. List all agents
  console.log('\nListing all agents for this wallet...');
  const allAgents = await dimm.listAgents();
  console.log(`Found ${allAgents.length} agent(s):`);
  allAgents.forEach((a, i) => {
    console.log(`${i + 1}. ${a.data.name} (${a.address.toString()})`);
  });

  // 10. Withdraw funds from agent (optional)
  // console.log('\nWithdrawing 0.1 SOL from agent...');
  // await agent.withdraw(0.1);
  // console.log('Withdrawal complete!');

  // 11. Revoke agent (optional - uncomment to test)
  // console.log('\nRevoking agent...');
  // await agent.revoke();
  // console.log('Agent revoked!');

  console.log('\n✅ Example completed successfully!');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the example
main().catch(console.error);

