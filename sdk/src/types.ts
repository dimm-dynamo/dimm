import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

/**
 * Agent permissions enum
 */
export enum AgentPermission {
  TRANSFER_SOL = 'TransferSol',
  SWAP_TOKENS = 'SwapTokens',
  NFT_OPERATIONS = 'NftOperations',
  STAKING = 'Staking',
  GOVERNANCE = 'Governance',
  DEFI_PROTOCOLS = 'DefiProtocols',
  TOKEN_ACCOUNTS = 'TokenAccounts',
  EXECUTE_PROGRAMS = 'ExecutePrograms',
}

/**
 * Activity type enum
 */
export enum ActivityType {
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

/**
 * Protocol configuration
 */
export interface ProtocolConfig {
  authority: PublicKey;
  merkleTree: PublicKey;
  totalAgents: BN;
  version: number;
  paused: boolean;
  bump: number;
}

/**
 * Agent account data
 */
export interface AgentAccount {
  mainWallet: PublicKey;
  agentId: BN;
  name: string;
  permissions: AgentPermission[];
  maxSolPerTransaction: BN;
  dailyLimit: BN;
  spentToday: BN;
  lastDailyReset: BN;
  totalSpent: BN;
  totalTransactions: BN;
  revoked: boolean;
  createdAt: BN;
  lastUsedAt: BN;
  leafIndex: number;
  bump: number;
}

/**
 * Agent activity record
 */
export interface AgentActivity {
  agent: PublicKey;
  activityType: ActivityType;
  amount: BN;
  destination?: PublicKey;
  reason: string;
  timestamp: BN;
  signature: Buffer;
  success: boolean;
  bump: number;
}

/**
 * Parameters for creating an agent
 */
export interface CreateAgentParams {
  name: string;
  permissions: AgentPermission[];
  maxSolPerTransaction: number; // in SOL
  dailyLimit: number; // in SOL
}

/**
 * Parameters for executing a transaction
 */
export interface ExecuteTransactionParams {
  activityType: ActivityType;
  amount: number; // in SOL
  destination?: PublicKey;
  instructionData?: Buffer;
}

/**
 * Parameters for updating limits
 */
export interface UpdateLimitsParams {
  maxSolPerTransaction?: number; // in SOL
  dailyLimit?: number; // in SOL
}

/**
 * Agent statistics
 */
export interface AgentStats {
  totalSpent: number; // in SOL
  spentToday: number; // in SOL
  totalTransactions: number;
  remainingDailyLimit: number; // in SOL
  createdAt: Date;
  lastUsedAt: Date;
}

/**
 * Transaction result
 */
export interface TransactionResult {
  signature: string;
  success: boolean;
  error?: string;
}

