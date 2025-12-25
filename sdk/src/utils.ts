import { Connection, PublicKey, Transaction, TransactionSignature, Commitment } from '@solana/web3.js';
import BN from 'bn.js';
import {
  PROTOCOL_SEED,
  AGENT_SEED,
  ACTIVITY_SEED,
  DIMM_PROGRAM_ID,
  LAMPORTS_PER_SOL,
} from './constants';

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): BN {
  return new BN(sol * LAMPORTS_PER_SOL);
}

/**
 * Convert lamports to SOL
 */
export function lamportsToSol(lamports: BN): number {
  return lamports.toNumber() / LAMPORTS_PER_SOL;
}

/**
 * Get protocol config PDA
 */
export async function getProtocolConfigPDA(
  authority: PublicKey,
  programId: PublicKey = DIMM_PROGRAM_ID
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [PROTOCOL_SEED, authority.toBuffer()],
    programId
  );
}

/**
 * Get agent account PDA
 */
export async function getAgentAccountPDA(
  mainWallet: PublicKey,
  agentId: BN,
  programId: PublicKey = DIMM_PROGRAM_ID
): Promise<[PublicKey, number]> {
  const agentIdBuffer = Buffer.alloc(8);
  agentIdBuffer.writeBigUInt64LE(BigInt(agentId.toString()));

  return PublicKey.findProgramAddressSync(
    [AGENT_SEED, mainWallet.toBuffer(), agentIdBuffer],
    programId
  );
}

/**
 * Get activity PDA
 */
export async function getActivityPDA(
  agentAccount: PublicKey,
  transactionCount: BN,
  programId: PublicKey = DIMM_PROGRAM_ID
): Promise<[PublicKey, number]> {
  const txCountBuffer = Buffer.alloc(8);
  txCountBuffer.writeBigUInt64LE(BigInt(transactionCount.toString()));

  return PublicKey.findProgramAddressSync(
    [ACTIVITY_SEED, agentAccount.toBuffer(), txCountBuffer],
    programId
  );
}

/**
 * Validate agent name
 */
export function validateAgentName(name: string): boolean {
  return name.length > 0 && name.length <= 32;
}

/**
 * Validate reason string
 */
export function validateReason(reason: string): boolean {
  return reason.length <= 128;
}

/**
 * Format timestamp to Date
 */
export function formatTimestamp(timestamp: BN): Date {
  return new Date(timestamp.toNumber() * 1000);
}

/**
 * Sleep helper
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry helper
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await sleep(delayMs);
      }
    }
  }
  
  throw lastError!;
}

/**
 * Shorten address for display (e.g., "ABC...XYZ")
 */
export function shortenAddress(address: string | PublicKey, chars: number = 4): string {
  const addr = typeof address === 'string' ? address : address.toString();
  if (addr.length <= chars * 2) return addr;
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
}

/**
 * Parse error message from transaction error
 */
export function parseErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  
  if (error?.message) {
    // Extract custom program error
    const match = error.message.match(/custom program error: (0x[0-9a-fA-F]+)/);
    if (match) {
      const errorCode = parseInt(match[1], 16);
      return `Program error code: ${errorCode}`;
    }
    return error.message;
  }
  
  return 'Unknown error';
}

/**
 * Wait for transaction confirmation with timeout
 */
export async function confirmTransaction(
  connection: Connection,
  signature: TransactionSignature,
  commitment: Commitment = 'confirmed',
  timeoutMs: number = 60000
): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    try {
      const status = await connection.getSignatureStatus(signature);
      
      if (status?.value?.confirmationStatus === commitment || 
          status?.value?.confirmationStatus === 'finalized') {
        return !status.value.err;
      }
      
      if (status?.value?.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(status.value.err)}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('failed')) {
        throw error;
      }
    }
    
    await sleep(1000);
  }
  
  throw new Error('Transaction confirmation timeout');
}

/**
 * Check if account has sufficient balance
 */
export async function hasSufficientBalance(
  connection: Connection,
  address: PublicKey,
  requiredLamports: number
): Promise<boolean> {
  const balance = await connection.getBalance(address);
  return balance >= requiredLamports;
}

/**
 * Format SOL amount with decimals
 */
export function formatSol(
  lamports: number | BN,
  decimals: number = 4,
  suffix: boolean = true
): string {
  const amount = typeof lamports === 'number' 
    ? lamports / LAMPORTS_PER_SOL 
    : lamports.toNumber() / LAMPORTS_PER_SOL;
  
  const formatted = amount.toFixed(decimals);
  return suffix ? `${formatted} SOL` : formatted;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(timestamp: Date | number): string {
  const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return `${diffSecs} seconds ago`;
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 30) return `${diffDays} days ago`;
  
  return date.toLocaleDateString();
}

/**
 * Format date to readable string
 */
export function formatDate(
  timestamp: Date | number | BN,
  includeTime: boolean = true
): string {
  let date: Date;
  
  if (timestamp instanceof BN) {
    date = new Date(timestamp.toNumber() * 1000);
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else {
    date = timestamp;
  }
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return date.toLocaleString('en-US', options);
}

/**
 * Get Solana Explorer URL for transaction
 */
export function getExplorerUrl(
  signature: string,
  type: 'tx' | 'address' | 'block' = 'tx',
  cluster: 'mainnet-beta' | 'devnet' | 'testnet' = 'devnet'
): string {
  const baseUrl = 'https://explorer.solana.com';
  const clusterParam = cluster === 'mainnet-beta' ? '' : `?cluster=${cluster}`;
  
  switch (type) {
    case 'tx':
      return `${baseUrl}/tx/${signature}${clusterParam}`;
    case 'address':
      return `${baseUrl}/address/${signature}${clusterParam}`;
    case 'block':
      return `${baseUrl}/block/${signature}${clusterParam}`;
    default:
      return baseUrl;
  }
}

/**
 * Get Solscan URL
 */
export function getSolscanUrl(
  signature: string,
  type: 'tx' | 'account' | 'token' = 'tx',
  cluster: 'mainnet' | 'devnet' | 'testnet' = 'devnet'
): string {
  const baseUrl = cluster === 'mainnet' 
    ? 'https://solscan.io' 
    : `https://solscan.io`;
  const clusterParam = cluster === 'mainnet' ? '' : `?cluster=${cluster}`;
  
  switch (type) {
    case 'tx':
      return `${baseUrl}/tx/${signature}${clusterParam}`;
    case 'account':
      return `${baseUrl}/account/${signature}${clusterParam}`;
    case 'token':
      return `${baseUrl}/token/${signature}${clusterParam}`;
    default:
      return baseUrl;
  }
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Batch process items with concurrency limit
 */
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10,
  delayMs: number = 100
): Promise<R[]> {
  const results: R[] = [];
  const batches = chunk(items, batchSize);
  
  for (const batch of batches) {
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
    
    if (delayMs > 0) {
      await sleep(delayMs);
    }
  }
  
  return results;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitMs);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limitMs);
    }
  };
}

/**
 * Validate Solana address
 */
export function isValidAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safe BN conversion
 */
export function toBN(value: number | string | BN): BN {
  if (BN.isBN(value)) return value;
  return new BN(value);
}

/**
 * Compare two BN values
 */
export function compareBN(a: BN, b: BN): -1 | 0 | 1 {
  if (a.lt(b)) return -1;
  if (a.gt(b)) return 1;
  return 0;
}

/**
 * Calculate time remaining until daily reset
 */
export function getTimeUntilReset(lastReset: Date | number | BN): {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
} {
  let resetTime: Date;
  
  if (lastReset instanceof BN) {
    resetTime = new Date(lastReset.toNumber() * 1000);
  } else if (typeof lastReset === 'number') {
    resetTime = new Date(lastReset * 1000);
  } else {
    resetTime = lastReset;
  }
  
  const nextReset = new Date(resetTime);
  nextReset.setDate(nextReset.getDate() + 1);
  
  const now = new Date();
  const diffMs = nextReset.getTime() - now.getTime();
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    totalSeconds,
  };
}

/**
 * Create transaction URL shortener
 */
export function createTxUrl(signature: string, cluster?: string): string {
  return getExplorerUrl(signature, 'tx', cluster as any);
}

/**
 * Estimate transaction fee
 */
export async function estimateTransactionFee(
  connection: Connection,
  transaction: Transaction,
  commitment: Commitment = 'confirmed'
): Promise<number> {
  try {
    const { value } = await connection.getFeeForMessage(
      transaction.compileMessage(),
      commitment
    );
    return value || 5000; // Default to 5000 lamports
  } catch {
    return 5000;
  }
}


