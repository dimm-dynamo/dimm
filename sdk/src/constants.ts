import { PublicKey } from '@solana/web3.js';

/**
 * DIMM Program ID (update after deployment)
 */
export const DIMM_PROGRAM_ID = new PublicKey(
  'DimmProgram11111111111111111111111111111111'
);

/**
 * Seed constants for PDAs
 */
export const PROTOCOL_SEED = Buffer.from('dimm_protocol');
export const AGENT_SEED = Buffer.from('dimm_agent');
export const ACTIVITY_SEED = Buffer.from('dimm_activity');
export const TREE_AUTHORITY_SEED = Buffer.from('tree_authority');

/**
 * Configuration constants
 */
export const MAX_AGENTS_PER_WALLET = 10000;
export const MAX_AGENT_NAME_LENGTH = 32;
export const MAX_REASON_LENGTH = 128;
export const MIN_AGENT_BALANCE = 5_000_000; // 0.005 SOL
export const DEFAULT_DAILY_LIMIT = 1_000_000_000; // 1 SOL
export const DEFAULT_TX_LIMIT = 100_000_000; // 0.1 SOL
export const LAMPORTS_PER_SOL = 1_000_000_000;

/**
 * Merkle tree configuration
 */
export const DEFAULT_MAX_DEPTH = 14;
export const DEFAULT_MAX_BUFFER_SIZE = 64;

