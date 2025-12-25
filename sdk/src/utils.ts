import { PublicKey } from '@solana/web3.js';
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

