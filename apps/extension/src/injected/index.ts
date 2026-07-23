// EIP-1193 and EIP-6963 Provider Injection
// Runs in the dApp page context

class VaultXProvider {
  public isVaultX = true;
  public isMetaMask = true; // Fallback legacy compatibility
  public chainId: string | null = null;
  public networkVersion: string | null = null;
  public selectedAddress: string | null = null;

  private callbacks = new Map<number, { resolve: Function; reject: Function }>();
  private nextId = 0;
  private listeners = new Map<string, Set<Function>>();

  constructor() {
    window.addEventListener('message', (event) => {
      // For file:// pages both event.origin and location.origin are "null"
      if (event.source !== window) return;
      const originOk =
        event.origin === window.location.origin ||
        event.origin === 'null' ||
        window.location.origin === 'null';
      if (!originOk) return;

      if (event.data && event.data.target === 'VAULTX_INJECTED_SCRIPT') {
        const { id, payload, type, eventName } = event.data;

        // Handle Background Events (e.g. accountsChanged)
        if (type === 'EVENT' && eventName) {
          if (eventName === 'chainChanged') {
            this.chainId = payload;
            this.networkVersion = parseInt(payload, 16).toString();
          } else if (eventName === 'accountsChanged') {
            this.selectedAddress = Array.isArray(payload) && payload.length > 0 ? payload[0] : null;
          }
          this.emit(eventName, payload);
          return;
        }

        // Handle RPC Responses
        if (id !== undefined && this.callbacks.has(id)) {
          const { resolve, reject } = this.callbacks.get(id)!;
          this.callbacks.delete(id);

          if (payload && payload.success === false) {
            reject(new Error(payload.error || 'RPC Error'));
          } else {
            resolve(payload && payload.data !== undefined ? payload.data : null);
          }
        }
      }
    });
  }

  public async request(args: { method: string; params?: unknown[] }): Promise<any> {
    if (!args || typeof args !== 'object' || Array.isArray(args)) {
      throw new Error('Expected a single object argument.');
    }
    const { method, params } = args;
    if (typeof method !== 'string' || method.length === 0) {
      throw new Error('Method must be a non-empty string.');
    }

    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.callbacks.set(id, { resolve, reject });

      const targetOrigin = ['null', 'file://'].includes(window.location.origin)
        ? '*'
        : window.location.origin;
      window.postMessage(
        {
          target: 'VAULTX_CONTENT_SCRIPT',
          id,
          payload: {
            id: id.toString(),
            type: 'RPC_REQUEST',
            payload: { jsonrpc: '2.0', method, params }
          }
        },
        targetOrigin
      );
    });
  }

  // EIP-1193 Event Emitter interface
  public on(event: string, listener: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  public removeListener(event: string, listener: (...args: any[]) => void): void {
    const eventSet = this.listeners.get(event);
    if (eventSet) {
      eventSet.delete(listener);
    }
  }

  public off(event: string, listener: (...args: any[]) => void): void {
    this.removeListener(event, listener);
  }

  private emit(event: string, payload: any): void {
    const eventSet = this.listeners.get(event);
    if (eventSet) {
      eventSet.forEach((listener) => listener(payload));
    }
  }
}

// 1. Initialize Provider
const provider = new VaultXProvider();

// 2. Announce via EIP-6963 (Preferred Mechanism)
function announceProvider() {
  const info = {
    uuid: '7faee08d-3b7c-47ea-bd53-c90a194edc0f',
    name: 'VaultX',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij48Y2lyY2xlIGN4PSI2NCIgY3k9IjY0IiByPSI2NCIgZmlsbD0iIzAwMCIvPjxwYXRoIGQ9Ik0zMiA5NmwzMi02NCAzMiA2NCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjgiLz48L3N2Zz4=',
    rdns: 'com.vaultx.wallet'
  };

  window.dispatchEvent(
    new CustomEvent('eip6963:announceProvider', {
      detail: Object.freeze({ info, provider })
    })
  );
}

// Listen for dApp requests for providers
window.addEventListener('eip6963:requestProvider', () => announceProvider());

// Announce immediately
announceProvider();

// 3. Fallback to legacy window.ethereum
if (!(window as any).ethereum) {
  (window as any).ethereum = provider;
} else if ((window as any).ethereum && !(window as any).ethereum.isVaultX) {
  // Coexistence handling: proxy or array (some wallets use providers array)
  if (!(window as any).ethereum.providers) {
    (window as any).ethereum.providers = [(window as any).ethereum];
  }
  (window as any).ethereum.providers.push(provider);
}

// 4. Initialize state
provider
  .request({ method: 'eth_chainId' })
  .then((chainId) => {
    provider.chainId = chainId;
    provider.networkVersion = parseInt(chainId, 16).toString();

    // Emit standard connect event
    window.dispatchEvent(new CustomEvent('ethereum#initialized'));

    // It is private emit in class, we can call it if we bypass TS or expose it
    (provider as any).emit('connect', { chainId });
  })
  .catch(console.error);

provider
  .request({ method: 'eth_accounts' })
  .then((accounts) => {
    if (accounts && accounts.length > 0) {
      provider.selectedAddress = accounts[0];
    }
  })
  .catch(console.error);
