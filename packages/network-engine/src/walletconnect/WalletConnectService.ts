import { Core } from '@walletconnect/core';
import type { IWeb3Wallet } from '@walletconnect/web3wallet';
import { Web3Wallet } from '@walletconnect/web3wallet';
import type { IKeyValueStorage } from '@walletconnect/keyvaluestorage';

import type {
  IWalletConnectService,
  WCSessionProposal,
  WCSessionRequest,
  WCSession
} from './types.js';

// Fallback metadata for VaultX
const VAULTX_METADATA = {
  name: 'VaultX',
  description: 'VaultX Secure Wallet',
  url: 'https://vaultx.app',
  icons: ['https://vaultx.app/favicon.ico']
};

class SimpleEventEmitter {
  private listeners: Record<string, Function[]> = {};
  public on(event: string, fn: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }
  public off(event: string, fn: Function) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((l) => l !== fn);
  }
  public emit(event: string, ...args: any[]) {
    if (!this.listeners[event]) return;
    for (const fn of this.listeners[event]) fn(...args);
  }
}

export class WalletConnectService extends SimpleEventEmitter implements IWalletConnectService {
  private core: any;
  private web3wallet!: IWeb3Wallet;
  private isInitialized = false;

  constructor() {
    super();
  }

  public async init(projectId: string, storage?: IKeyValueStorage): Promise<void> {
    if (this.isInitialized) return;
    if (!projectId) {
      console.warn('[WalletConnectService] Missing Project ID. WC will not initialize.');
      return;
    }

    try {
      const coreOptions: any = { projectId };
      if (storage) {
        coreOptions.storage = storage;
      }
      this.core = new Core(coreOptions);

      this.web3wallet = await Web3Wallet.init({
        core: this.core,
        metadata: VAULTX_METADATA
      });

      this.setupEventListeners();
      this.isInitialized = true;
      console.log('[WalletConnectService] Initialized successfully.');
    } catch (err) {
      console.error('[WalletConnectService] Failed to initialize', err);
    }
  }

  private setupEventListeners() {
    this.web3wallet.on('session_proposal', (proposal) => {
      console.log('[WalletConnectService] Received session_proposal');

      const normalizedProposal: WCSessionProposal = {
        id: proposal.id,
        proposer: {
          name: proposal.params.proposer.metadata.name || 'Unknown DApp',
          description: proposal.params.proposer.metadata.description || '',
          url: proposal.params.proposer.metadata.url || '',
          icons: proposal.params.proposer.metadata.icons || []
        },
        requiredNamespaces: proposal.params.requiredNamespaces,
        optionalNamespaces: proposal.params.optionalNamespaces
      };

      this.emit('session_proposal', normalizedProposal);
    });

    this.web3wallet.on('session_request', (requestEvent) => {
      console.log('[WalletConnectService] Received session_request', requestEvent);

      const session = this.web3wallet.engine.signClient.session.get(requestEvent.topic);
      const peer = session?.peer.metadata || { name: 'Unknown', url: '', icons: [] };

      const normalizedRequest: WCSessionRequest = {
        id: requestEvent.id,
        topic: requestEvent.topic,
        chainId: requestEvent.params.chainId,
        request: {
          method: requestEvent.params.request.method,
          params: requestEvent.params.request.params
        },
        peer: {
          name: peer.name,
          url: peer.url,
          icons: peer.icons
        }
      };

      this.emit('session_request', normalizedRequest);
    });

    this.web3wallet.on('session_delete', (session) => {
      console.log('[WalletConnectService] Received session_delete', session);
      this.emit('session_delete', session.topic);
    });
  }

  public async pair(uri: string): Promise<void> {
    if (!this.isInitialized) throw new Error('WC not initialized');
    await this.core.pairing.pair({ uri });
  }

  public async approveSession(
    id: number,
    eip155Address: string,
    approvedChains: number[]
  ): Promise<void> {
    if (!this.isInitialized) throw new Error('WC not initialized');

    // We only support EIP155
    const accounts = approvedChains.map((c) => `eip155:${c}:${eip155Address}`);

    const namespaces = {
      eip155: {
        accounts,
        methods: [
          'eth_sendTransaction',
          'personal_sign',
          'eth_signTypedData_v4',
          'eth_sign',
          'eth_accounts',
          'eth_chainId'
        ],
        events: ['chainChanged', 'accountsChanged']
      }
    };

    await this.web3wallet.approveSession({
      id,
      namespaces
    });
  }

  public async rejectSession(id: number, reason: string): Promise<void> {
    if (!this.isInitialized) return;
    await this.web3wallet.rejectSession({
      id,
      reason: {
        code: 5000,
        message: reason
      }
    });
  }

  public async respondToRequest(topic: string, response: any): Promise<void> {
    if (!this.isInitialized) return;
    await this.web3wallet.respondSessionRequest({
      topic,
      response
    });
  }

  public getActiveSessions(): WCSession[] {
    if (!this.isInitialized) return [];

    const active = this.web3wallet.getActiveSessions();

    return Object.values(active).map((session) => ({
      topic: session.topic,
      peer: {
        name: session.peer.metadata.name,
        description: session.peer.metadata.description,
        url: session.peer.metadata.url,
        icons: session.peer.metadata.icons
      },
      namespaces: session.namespaces,
      expiry: session.expiry
    }));
  }

  public async disconnectSession(topic: string): Promise<void> {
    if (!this.isInitialized) return;
    await this.web3wallet.disconnectSession({
      topic,
      reason: {
        code: 6000,
        message: 'User disconnected session'
      }
    });
  }
}
