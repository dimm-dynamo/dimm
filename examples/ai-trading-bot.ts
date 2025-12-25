/**
 * AI Trading Bot Example
 * 
 * This example demonstrates how to integrate DIMM with an AI service
 * to create an autonomous trading bot with safety limits.
 */

import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { DimmClient, AgentPermission, ActivityType } from '@dimm/sdk';

// Mock AI service (replace with actual AI integration)
class AITradingService {
  async analyzeMarket(): Promise<{
    action: 'buy' | 'sell' | 'hold';
    token: string;
    amount: number;
    confidence: number;
    reason: string;
  }> {
    // In production, this would call GPT-4, Claude, or custom AI model
    // For demo, return mock data
    return {
      action: 'buy',
      token: 'SOL/USDC',
      amount: 0.05,
      confidence: 0.85,
      reason: 'Technical indicators show strong upward momentum',
    };
  }

  async getRiskAssessment(action: string, amount: number): Promise<{
    risk: 'low' | 'medium' | 'high';
    recommendation: string;
  }> {
    // AI-powered risk assessment
    if (amount > 0.1) {
      return {
        risk: 'high',
        recommendation: 'Consider reducing position size',
      };
    }
    return {
      risk: 'low',
      recommendation: 'Proceed with trade',
    };
  }
}

class TradingBot {
  private dimm: DimmClient;
  private agent: any;
  private ai: AITradingService;
  private running: boolean = false;

  constructor(
    connection: Connection,
    wallet: Keypair,
    private config: {
      maxTradeSize: number;      // Max SOL per trade
      dailyLimit: number;         // Max SOL per day
      minConfidence: number;      // Minimum AI confidence (0-1)
      checkInterval: number;      // How often to check market (ms)
    }
  ) {
    this.dimm = new DimmClient(connection, wallet);
    this.ai = new AITradingService();
  }

  async initialize() {
    console.log('🤖 Initializing AI Trading Bot...');

    // Create trading agent with appropriate permissions
    this.agent = await this.dimm.createAgent({
      name: 'AI-Trader-001',
      permissions: [
        AgentPermission.SWAP_TOKENS,
        AgentPermission.TOKEN_ACCOUNTS,
        AgentPermission.DEFI_PROTOCOLS,
      ],
      maxSolPerTransaction: this.config.maxTradeSize,
      dailyLimit: this.config.dailyLimit,
    });

    console.log('✅ Agent created:', this.agent.address.toString());

    // Fund the agent
    const fundAmount = this.config.dailyLimit * 0.5; // Fund with 50% of daily limit
    await this.agent.fund(fundAmount);
    console.log(`💰 Agent funded with ${fundAmount} SOL`);
  }

  async start() {
    console.log('🚀 Starting trading bot...');
    this.running = true;

    while (this.running) {
      try {
        await this.tradingCycle();
      } catch (error) {
        console.error('❌ Error in trading cycle:', error);
        await this.handleError(error);
      }

      // Wait before next cycle
      await sleep(this.config.checkInterval);
    }
  }

  async tradingCycle() {
    console.log('\n📊 Analyzing market...');

    // Get agent stats
    const stats = this.agent.getStats();
    console.log(`Daily budget remaining: ${stats.remainingDailyLimit} SOL`);

    // Check if we've hit daily limit
    if (stats.remainingDailyLimit < this.config.maxTradeSize) {
      console.log('⏸️  Daily limit reached, waiting for reset...');
      return;
    }

    // Get AI analysis
    const analysis = await this.ai.analyzeMarket();
    console.log('🧠 AI Analysis:', analysis);

    // Check confidence threshold
    if (analysis.confidence < this.config.minConfidence) {
      console.log('⚠️  Confidence too low, skipping trade');
      return;
    }

    // Get risk assessment
    const risk = await this.ai.getRiskAssessment(
      analysis.action,
      analysis.amount
    );
    console.log('🎯 Risk Assessment:', risk);

    // Don't trade if risk is high
    if (risk.risk === 'high') {
      console.log('🚫 Risk too high, skipping trade');
      return;
    }

    // Check if agent can afford this trade
    if (!this.agent.canSpend(analysis.amount)) {
      console.log('💸 Insufficient budget for this trade');
      return;
    }

    // Execute trade
    await this.executeTrade(analysis);
  }

  async executeTrade(analysis: any) {
    console.log(`\n💹 Executing ${analysis.action} trade...`);

    try {
      // In production, this would integrate with Jupiter, Raydium, etc.
      // For demo, we'll simulate with a transaction
      const result = await this.agent.executeTransaction({
        activityType: ActivityType.SWAP,
        amount: analysis.amount,
        // In real implementation, destination would be DEX program
        destination: Keypair.generate().publicKey,
      });

      if (result.success) {
        console.log('✅ Trade executed successfully!');
        console.log('📝 Transaction:', result.signature);
        console.log('💭 Reason:', analysis.reason);

        // Log trade details
        await this.logTrade({
          action: analysis.action,
          amount: analysis.amount,
          token: analysis.token,
          signature: result.signature,
          timestamp: new Date(),
        });
      } else {
        console.error('❌ Trade failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Trade execution error:', error);
      throw error;
    }
  }

  async logTrade(trade: any) {
    // In production, save to database or analytics service
    console.log('📊 Trade logged:', trade);
  }

  async handleError(error: any) {
    console.error('🔧 Handling error:', error);

    // Check if we should pause trading
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('insufficient') ||
        errorMessage.includes('limit') ||
        errorMessage.includes('revoked')) {
      console.log('⏸️  Critical error, pausing bot...');
      this.stop();

      // Notify admin
      await this.notifyAdmin({
        type: 'critical_error',
        error: error.message,
        timestamp: new Date(),
      });
    }
  }

  async notifyAdmin(notification: any) {
    // In production, send email, Slack message, etc.
    console.log('📧 Admin notification:', notification);
  }

  stop() {
    console.log('🛑 Stopping trading bot...');
    this.running = false;
  }

  async shutdown() {
    this.stop();

    // Withdraw remaining funds
    const balance = await this.agent.getBalance();
    if (balance > 0.01) {
      console.log(`💰 Withdrawing ${balance} SOL from agent...`);
      await this.agent.withdraw(balance - 0.005); // Keep some for rent
    }

    // Get final stats
    const stats = this.agent.getStats();
    console.log('\n📊 Final Statistics:');
    console.log('- Total trades:', stats.totalTransactions);
    console.log('- Total volume:', stats.totalSpent, 'SOL');
    console.log('- Created:', stats.createdAt);
    console.log('- Last trade:', stats.lastUsedAt);

    console.log('\n👋 Bot shutdown complete');
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main execution
async function main() {
  // Setup
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const wallet = Keypair.generate(); // In production, load from secure storage

  // Create bot instance
  const bot = new TradingBot(connection, wallet, {
    maxTradeSize: 0.1,       // Max 0.1 SOL per trade
    dailyLimit: 2.0,         // Max 2 SOL per day
    minConfidence: 0.75,     // Minimum 75% confidence
    checkInterval: 60000,    // Check every minute
  });

  // Initialize and start
  await bot.initialize();
  
  // Run for demo (in production, this would run continuously)
  console.log('\n🎬 Running bot for 5 minutes...\n');
  setTimeout(() => {
    bot.shutdown();
  }, 5 * 60 * 1000);

  await bot.start();
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { TradingBot };

