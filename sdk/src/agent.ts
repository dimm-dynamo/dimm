import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import BN from 'bn.js';
import {
  AgentAccount,
  AgentStats,
  ExecuteTransactionParams,
  TransactionResult,
  ActivityType,
} from './types';
import { lamportsToSol, formatTimestamp, getAgentAccountPDA } from './utils';
import { DimmClient } from './client';

/**
 * Agent class representing an AI agent SubAccount
 */
export class Agent {
  public address: PublicKey;
  public data: AgentAccount;
  
  constructor(
    private client: DimmClient,
    address: PublicKey,
    data: AgentAccount
  ) {
    this.address = address;
    this.data = data;
  }

  /**
   * Reload agent data from the blockchain
   */
  async reload(): Promise<void> {
    const account = await this.client.getAgentAccount(this.address);
    if (account) {
      this.data = account;
    }
  }

  /**
   * Get agent statistics
   */
  getStats(): AgentStats {
    return {
      totalSpent: lamportsToSol(this.data.totalSpent),
      spentToday: lamportsToSol(this.data.spentToday),
      totalTransactions: this.data.totalTransactions.toNumber(),
      remainingDailyLimit: lamportsToSol(
        this.data.dailyLimit.sub(this.data.spentToday)
      ),
      createdAt: formatTimestamp(this.data.createdAt),
      lastUsedAt: formatTimestamp(this.data.lastUsedAt),
    };
  }

  /**
   * Check if agent can spend a certain amount
   */
  canSpend(amountSol: number): boolean {
    const amountLamports = new BN(amountSol * 1_000_000_000);
    
    // Check per-transaction limit
    if (amountLamports.gt(this.data.maxSolPerTransaction)) {
      return false;
    }

    // Check daily limit
    const newDailyTotal = this.data.spentToday.add(amountLamports);
    if (newDailyTotal.gt(this.data.dailyLimit)) {
      return false;
    }

    return true;
  }

  /**
   * Execute a SOL transfer
   */
  async transferSol(
    destination: PublicKey,
    amount: number
  ): Promise<TransactionResult> {
    return this.client.executeTransaction(this.address, {
      activityType: ActivityType.TRANSFER,
      amount,
      destination,
    });
  }

  /**
   * Execute a generic transaction
   */
  async executeTransaction(
    params: ExecuteTransactionParams
  ): Promise<TransactionResult> {
    return this.client.executeTransaction(this.address, params);
  }

  /**
   * Get agent balance
   */
  async getBalance(): Promise<number> {
    const balance = await this.client.connection.getBalance(this.address);
    return balance / 1_000_000_000;
  }

  /**
   * Update agent limits
   */
  async updateLimits(params: {
    maxSolPerTransaction?: number;
    dailyLimit?: number;
  }): Promise<TransactionResult> {
    return this.client.updateLimits(this.address, params);
  }

  /**
   * Update agent permissions
   */
  async updatePermissions(permissions: string[]): Promise<TransactionResult> {
    return this.client.updatePermissions(this.address, permissions);
  }

  /**
   * Revoke agent
   */
  async revoke(): Promise<TransactionResult> {
    return this.client.revokeAgent(this.address);
  }

  /**
   * Fund this agent from main wallet
   */
  async fund(amount: number): Promise<TransactionResult> {
    return this.client.fundAgent(this.address, amount);
  }

  /**
   * Withdraw from this agent to main wallet
   */
  async withdraw(amount: number): Promise<TransactionResult> {
    return this.client.withdrawFromAgent(this.address, amount);
  }

  /**
   * Check if agent is active
   */
  isActive(): boolean {
    return !this.data.revoked;
  }

  /**
   * Get agent info
   */
  getInfo() {
    return {
      address: this.address.toString(),
      name: this.data.name,
      agentId: this.data.agentId.toString(),
      permissions: this.data.permissions,
      maxSolPerTransaction: lamportsToSol(this.data.maxSolPerTransaction),
      dailyLimit: lamportsToSol(this.data.dailyLimit),
      revoked: this.data.revoked,
      stats: this.getStats(),
    };
  }
}

