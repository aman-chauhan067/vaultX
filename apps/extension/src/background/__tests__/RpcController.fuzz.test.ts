import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@vaultx/web/src/services/VaultXService.js', () => {
  return {
    VaultXService: {
      getInstance: () => ({
        networkEngine: {
          execute: vi.fn(),
          provider: {
            send: vi.fn()
          }
        }
      })
    }
  };
});

vi.mock('@vaultx/web/src/services/VaultXProviderAdapter.js', () => {
  return {
    VaultXProviderAdapter: class {
      getBlockNumber() {
        return Promise.resolve(1n);
      }
      getBalance() {
        return Promise.resolve('0x0');
      }
      getTransactionCount() {
        return Promise.resolve(0n);
      }
      estimateGas() {
        return Promise.resolve('0x5208');
      }
      call() {
        return Promise.resolve('0x');
      }
    }
  };
});

vi.mock('../controllers/ProviderController.js', () => {
  return {
    ProviderController: {
      getActiveChainId: () => 1
    }
  };
});

vi.mock('../controllers/PermissionController.js', () => {
  return {
    PermissionController: {
      hasPermission: () => true,
      getAccountsForOrigin: () => ['0x123']
    }
  };
});

import { RpcController } from '../controllers/RpcController.js';

describe('RpcController Fuzz & Security Tests', () => {
  beforeEach(() => {
    // Reset any state if necessary
  });

  describe('Origin Validation', () => {
    it('rejects invalid or malformed origins', async () => {
      const invalidOrigins = [
        'file:///etc/passwd',
        'chrome://settings',
        'chrome-extension://malicious-id',
        'about:blank',
        'data:text/html,<h1>hello</h1>',
        'javascript:alert(1)',
        'blob:http://localhost/something',
        '',
        null as any,
        undefined as any
      ];

      for (const origin of invalidOrigins) {
        await expect(
          RpcController.handleRpcRequest({
            jsonrpc: '2.0',
            method: 'eth_chainId',
            params: [],
            origin
          })
        ).rejects.toThrow();
      }
    });

    it('accepts valid http/https origins', async () => {
      const validOrigins = ['http://localhost:3000', 'https://app.uniswap.org'];

      // We expect it might fail on rate limit or something else, but NOT on origin validation
      for (const origin of validOrigins) {
        try {
          await RpcController.handleRpcRequest({
            jsonrpc: '2.0',
            method: 'eth_chainId',
            params: [],
            origin
          });
        } catch (e: any) {
          expect(e.message).not.toMatch(/Origin protocol/i);
          expect(e.message).not.toMatch(/Invalid origin format/i);
          expect(e.message).not.toMatch(/Malformed origin URL/i);
        }
      }
    });
  });

  describe('Malformed JSON-RPC Payloads', () => {
    it('rejects missing jsonrpc version', async () => {
      await expect(
        RpcController.handleRpcRequest({
          method: 'eth_chainId',
          origin: 'https://example.com'
        })
      ).rejects.toThrow('Invalid JSON-RPC version');
    });

    it('rejects non-array params', async () => {
      await expect(
        RpcController.handleRpcRequest({
          jsonrpc: '2.0',
          method: 'eth_chainId',
          params: { foo: 'bar' }, // invalid, should be array
          origin: 'https://example.com'
        })
      ).rejects.toThrow('must be an array');
    });

    it('rejects oversized payloads (Fuzzing)', async () => {
      // 100KB payload
      const hugeParams = new Array(10000).fill('a'.repeat(10));
      await expect(
        RpcController.handleRpcRequest({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: hugeParams,
          origin: 'https://example.com'
        })
      ).rejects.toThrow('payload too large');
    });
  });

  describe('Rate Limiting', () => {
    it('blocks excessive read requests', async () => {
      const origin = 'https://spammer.com';
      let blocked = false;

      try {
        for (let i = 0; i < 305; i++) {
          await RpcController.handleRpcRequest({
            jsonrpc: '2.0',
            method: 'eth_chainId',
            params: [],
            origin
          });
        }
      } catch (e: any) {
        if (e.message.includes('Rate limit exceeded')) {
          blocked = true;
        }
      }

      expect(blocked).toBe(true);
    });

    it('blocks excessive sensitive requests rapidly', async () => {
      const origin = 'https://sensitive-spammer.com';
      let blocked = false;

      try {
        for (let i = 0; i < 10; i++) {
          await RpcController.handleRpcRequest({
            jsonrpc: '2.0',
            method: 'wallet_requestPermissions',
            params: [],
            origin
          });
        }
      } catch (e: any) {
        if (e.message.includes('Rate limit exceeded')) {
          blocked = true;
        }
      }

      expect(blocked).toBe(true);
    });
  });
});
