import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { Program, AnchorProvider, Wallet, BN } from '@coral-xyz/anchor';
import {
  CreateAgentParams,
  ExecuteTransactionParams,
  UpdateLimitsParams,
  AgentAccount,
  ProtocolConfig,
  TransactionResult,
  AgentPermission,
  ActivityType,
} from './types';
import {
  getProtocolConfigPDA,
  getAgentAccountPDA,
  solToLamports,
  validateAgentName,
} from './utils';
import { DIMM_PROGRAM_ID } from './constants';
import { Agent } from './agent';

/**
 * Main DIMM Client for interacting with the protocol
 */
export class DimmClient {
  public connection: Connection;
  public wallet: Keypair;
  public programId: PublicKey;
  private provider: AnchorProvider;

  constructor(
    connection: Connection,
    wallet: Keypair,
    programId: PublicKey = DIMM_PROGRAM_ID
  ) {
    this.connection = connection;
    this.wallet = wallet;
    this.programId = programId;
    
    // Create provider
    const walletWrapper = {
      publicKey: wallet.publicKey,
      signTransaction: async (tx: Transaction) => {
        tx.partialSign(wallet);
        return tx;
      },
      signAllTransactions: async (txs: Transaction[]) => {
        txs.forEach((tx) => tx.partialSign(wallet));
        return txs;
      },
    };

    this.provider = new AnchorProvider(
      connection,
      walletWrapper as Wallet,
      { commitment: 'confirmed' }
    );
  }

  /**
   * Initialize the DIMM protocol
   */
  async initialize(params?: {
    maxDepth?: number;
    maxBufferSize?: number;
  }): Promise<TransactionResult> {
    try {
      const [protocolConfig] = await getProtocolConfigPDA(this.wallet.publicKey);
      
      // For simplicity, we'll just create the account without full merkle tree setup
      // In production, you'd integrate with SPL Account Compression
      
      const tx = new Transaction();
      // Add initialize instruction here
      // This is a simplified version - full implementation would use Anchor IDL
      
      const signature = await sendAndConfirmTransaction(
        this.connection,
        tx,
        [this.wallet]
      );

      return {
        signature,
        success: true,
      };
    } catch (error) {
      return {
        signature: '',
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Create a new AI agent
   */
  async createAgent(params: CreateAgentParams): Promise<Agent> {
    // Validate inputs
    if (!validateAgentName(params.name)) {
      throw new Error('Invalid agent name');
    }

    // Get protocol config to determine agent ID
    const [protocolConfigPDA] = await getProtocolConfigPDA(
      this.wallet.publicKey
    );
    
    const protocolConfig = await this.getProtocolConfig();
    const agentId = protocolConfig ? protocolConfig.totalAgents : new BN(0);

    // Get agent PDA
    const [agentPDA] = await getAgentAccountPDA(
      this.wallet.publicKey,
      agentId
    );

    // Create transaction
    // In production, this would use the Anchor IDL to build the instruction
    const tx = new Transaction();
    
    // Simplified: In real implementation, use Anchor program methods
    // tx.add(program.instruction.createAgent(...));

    try {
      const signature = await sendAndConfirmTransaction(
        this.connection,
        tx,
        [this.wallet]
      );

      // Fetch and return agent
      const agentAccount = await this.getAgentAccount(agentPDA);
      if (!agentAccount) {
        throw new Error('Failed to fetch created agent');
      }

      return new Agent(this, agentPDA, agentAccount);
    } catch (error) {
      throw new Error(`Failed to create agent: ${(error as Error).message}`);
    }
  }

  /**
   * Get agent account data
   */
  async getAgentAccount(address: PublicKey): Promise<AgentAccount | null> {
    try {
      const accountInfo = await this.connection.getAccountInfo(address);
      if (!accountInfo) return null;

      // Deserialize account data
      // In production, use Anchor's account deserialization
      // For now, return mock data for demonstration
      
      return null; // Replace with actual deserialization
    } catch (error) {
      console.error('Error fetching agent account:', error);
      return null;
    }
  }

  /**
   * Get protocol config
   */
  async getProtocolConfig(): Promise<ProtocolConfig | null> {
    try {
      const [protocolConfigPDA] = await getProtocolConfigPDA(
        this.wallet.publicKey
      );
      
      const accountInfo = await this.connection.getAccountInfo(protocolConfigPDA);
      if (!accountInfo) return null;

      // Deserialize config
      // In production, use Anchor deserialization
      
      return null; // Replace with actual deserialization
    } catch (error) {
      console.error('Error fetching protocol config:', error);
      return null;
    }
  }

  /**
   * Get agent by ID
   */
  async getAgent(agentId: BN): Promise<Agent | null> {
    const [agentPDA] = await getAgentAccountPDA(this.wallet.publicKey, agentId);
    const agentAccount = await this.getAgentAccount(agentPDA);
    
    if (!agentAccount) return null;
    
    return new Agent(this, agentPDA, agentAccount);
  }

  /**
   * Fund an agent from main wallet
   */
  async fundAgent(
    agentAddress: PublicKey,
    amount: number
  ): Promise<TransactionResult> {
    try {
      const lamports = solToLamports(amount);
      
      const tx = new Transaction();
      // Add fund instruction
      
      const signature = await sendAndConfirmTransaction(
        this.connection,
        tx,
        [this.wallet]
      );

      return {
        signature,
        success: true,
      };
    } catch (error) {
      return {
        signature: '',
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Execute a transaction through an agent
   */
  async executeTransaction(
    agentAddress: PublicKey,
    params: ExecuteTransactionParams
  ): Promise<TransactionResult> {
    try {
      const lamports = solToLamports(params.amount);
      
      const tx = new Transaction();
      // Add execute transaction instruction
      
      const signature = await sendAndConfirmTransaction(
        this.connection,
        tx,
        [this.wallet]
      );

      return {
        signature,
        success: true,
      };
    } catch (error) {
      return {
        signature: '',
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Update agent permissions
   */
  async updatePermissions(
    agentAddress: PublicKey,
    permissions: string[]
  ): Promise<TransactionResult> {
    try {
      const tx = new Transaction();
      // Add update permissions instruction
      
      const signature = await sendAndConfirmTransaction(
        this.connection,
        tx,
        [this.wallet]
      );

      return {
        signature,
        success: true,
      };
    } catch (error) {
      return {
        signature: '',
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Update agent limits
   */
  async updateLimits(
    agentAddress: PublicKey,
    params: UpdateLimitsParams
  ): Promise<TransactionResult> {
    try {
      const tx = new Transaction();
      // Add update limits instruction
      
      const signature = await sendAndConfirmTransaction(
        this.connection,
        tx,
        [this.wallet]
      );

      return {
        signature,
        success: true,
      };
    } catch (error) {
      return {
        signature: '',
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Revoke an agent
   */
  async revokeAgent(agentAddress: PublicKey): Promise<TransactionResult> {
    try {
      const tx = new Transaction();
      // Add revoke instruction
      
      const signature = await sendAndConfirmTransaction(
        this.connection,
        tx,
        [this.wallet]
      );

      return {
        signature,
        success: true,
      };
    } catch (error) {
      return {
        signature: '',
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Withdraw from agent to main wallet
   */
  async withdrawFromAgent(
    agentAddress: PublicKey,
    amount: number
  ): Promise<TransactionResult> {
    try {
      const lamports = solToLamports(amount);
      
      const tx = new Transaction();
      // Add withdraw instruction
      
      const signature = await sendAndConfirmTransaction(
        this.connection,
        tx,
        [this.wallet]
      );

      return {
        signature,
        success: true,
      };
    } catch (error) {
      return {
        signature: '',
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * List all agents for the wallet
   */
  async listAgents(): Promise<Agent[]> {
    const protocolConfig = await this.getProtocolConfig();
    if (!protocolConfig) return [];

    const agents: Agent[] = [];
    
    for (let i = 0; i < protocolConfig.totalAgents.toNumber(); i++) {
      const agent = await this.getAgent(new BN(i));
      if (agent) {
        agents.push(agent);
      }
    }

    return agents;
  }
}

