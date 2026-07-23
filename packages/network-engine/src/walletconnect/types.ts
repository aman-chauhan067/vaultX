export interface WCSessionProposal {
  id: number;
  proposer: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
  requiredNamespaces: Record<string, WCProposalNamespace>;
  optionalNamespaces?: Record<string, WCProposalNamespace>;
}

export interface WCProposalNamespace {
  chains?: string[];
  methods: string[];
  events: string[];
}

export interface WCSessionRequest {
  id: number;
  topic: string;
  chainId: string;
  request: {
    method: string;
    params: any;
  };
  peer: {
    name: string;
    url: string;
    icons: string[];
  };
}

export interface WCSession {
  topic: string;
  peer: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
  namespaces: Record<string, WCSessionNamespace>;
  expiry: number;
}

export interface WCSessionNamespace {
  accounts: string[];
  methods: string[];
  events: string[];
}

export interface WCErrorResponse {
  code: number;
  message: string;
}

export interface IWalletConnectService {
  init(projectId: string, storage?: any): Promise<void>;
  pair(uri: string): Promise<void>;
  approveSession(id: number, eip155Address: string, approvedChains: number[]): Promise<void>;
  rejectSession(id: number, reason: string): Promise<void>;
  respondToRequest(topic: string, response: any): Promise<void>;
  getActiveSessions(): WCSession[];
  disconnectSession(topic: string): Promise<void>;

  on(event: 'session_proposal', listener: (proposal: WCSessionProposal) => void): void;
  on(event: 'session_request', listener: (request: WCSessionRequest) => void): void;
  on(event: 'session_delete', listener: (topic: string) => void): void;

  off(event: string, listener: any): void;
}
