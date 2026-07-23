import { VaultXService } from '@vaultx/web/src/services/VaultXService.js';
import { VaultXProviderAdapter } from '@vaultx/web/src/services/VaultXProviderAdapter.js';
import { PermissionController } from './PermissionController.js';
import { ProviderController } from './ProviderController.js';
import { ApprovalController } from './ApprovalController.js';
import type { ProviderRequest } from '../../messaging/types.js';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  read: { maxRequests: 300, windowMs: 60 * 1000 }, // 300 per minute
  write: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 per minute
  sensitive: { maxRequests: 5, windowMs: 60 * 1000 } // 5 per minute
};

const REQUEST_COUNTS: Record<string, { count: number; resetAt: number }> = {};

export class RpcController {
  private static validateOrigin(origin: string): void {
    if (!origin || typeof origin !== 'string') {
      throw new Error('Invalid origin format');
    }

    // Strict blocklist for extension context
    const blockedProtocols = [
      'file:',
      'chrome:',
      'chrome-extension:',
      'about:',
      'data:',
      'javascript:',
      'blob:'
    ];
    if (origin === 'null' || origin.startsWith('file://')) return; // Allow local files for testing

    try {
      const url = new URL(origin);
      if (blockedProtocols.includes(url.protocol)) {
        throw new Error(`Origin protocol ${url.protocol} is not allowed`);
      }
    } catch {
      throw new Error('Malformed origin URL');
    }
  }

  private static validateRequest(request: any): asserts request is ProviderRequest {
    if (!request || typeof request !== 'object') {
      throw { code: -32600, message: 'Invalid Request' };
    }
    if (request.jsonrpc !== '2.0') {
      throw { code: -32600, message: 'Invalid JSON-RPC version' };
    }
    if (typeof request.method !== 'string' || !request.method) {
      throw { code: -32600, message: 'Invalid method' };
    }
    if (request.params !== undefined && !Array.isArray(request.params)) {
      throw { code: -32602, message: 'Invalid params: must be an array' };
    }
    // Simple payload size check (approximate, since it's already an object, checking stringified size)
    const size = JSON.stringify(request).length;
    if (size > 1024 * 50) {
      // 50KB limit per request
      throw { code: -32600, message: 'Request payload too large' };
    }
  }

  private static checkRateLimit(origin: string, type: 'read' | 'write' | 'sensitive'): void {
    const key = `${origin}:${type}`;
    const limit = RATE_LIMITS[type];
    const now = Date.now();

    if (!REQUEST_COUNTS[key] || now > REQUEST_COUNTS[key].resetAt) {
      REQUEST_COUNTS[key] = { count: 0, resetAt: now + limit.windowMs };
    }

    REQUEST_COUNTS[key].count++;

    if (REQUEST_COUNTS[key].count > limit.maxRequests) {
      throw { code: -32005, message: 'Rate limit exceeded' };
    }
  }

  public static async handleRpcRequest(rawRequest: any): Promise<any> {
    try {
      this.validateRequest(rawRequest);
    } catch (e: any) {
      // Return proper JSON-RPC error
      throw new Error(e.message);
    }

    const request: ProviderRequest = rawRequest;
    const { method, params = [], origin } = request;

    this.validateOrigin(origin);

    // 1. Permission Requests (Sensitive)
    if (method === 'eth_requestAccounts' || method === 'wallet_requestPermissions') {
      this.checkRateLimit(origin, 'sensitive');
      if (PermissionController.hasPermission(origin)) {
        return PermissionController.getAccountsForOrigin(origin);
      }
      // Needs Approval
      await ApprovalController.requestApproval(request);
      return 'PENDING_APPROVAL';
    }

    if (method === 'wallet_getPermissions') {
      this.checkRateLimit(origin, 'read');
      return PermissionController.hasPermission(origin)
        ? [{ parentCapability: 'eth_accounts' }]
        : [];
    }

    if (method === 'wallet_revokePermissions') {
      this.checkRateLimit(origin, 'sensitive');
      await PermissionController.revokePermission(origin);
      return null;
    }

    // 2. Read-Only Standard Provider Methods
    const readMethods = [
      'eth_accounts',
      'eth_chainId',
      'net_version',
      'eth_blockNumber',
      'eth_getBalance',
      'eth_getTransactionCount',
      'eth_estimateGas',
      'eth_call',
      'eth_getCode',
      'eth_getLogs',
      'eth_feeHistory',
      'eth_getBlockByNumber',
      'eth_getBlockByHash',
      'eth_getTransactionByHash',
      'eth_getStorageAt'
    ];

    if (readMethods.includes(method)) {
      this.checkRateLimit(origin, 'read');
      const networkEngine = VaultXService.getInstance().networkEngine;
      const provider = new VaultXProviderAdapter(networkEngine);

      try {
        switch (method) {
          case 'eth_accounts':
            return PermissionController.hasPermission(origin)
              ? PermissionController.getAccountsForOrigin(origin)
              : [];
          case 'eth_chainId':
            return `0x${ProviderController.getActiveChainId().toString(16)}`;
          case 'net_version':
            return ProviderController.getActiveChainId().toString();
          case 'eth_blockNumber':
            return `0x${(await provider.getBlockNumber()).toString(16)}`;
          case 'eth_getBalance':
            if (!params[0]) throw new Error('Missing address param');
            return provider.getBalance(params[0]);
          case 'eth_getTransactionCount':
            if (!params[0]) throw new Error('Missing address param');
            return `0x${(await provider.getTransactionCount(params[0])).toString(16)}`;
          case 'eth_estimateGas':
            if (!params[0]) throw new Error('Missing tx param');
            return provider.estimateGas(params[0]);
          case 'eth_call':
            if (!params[0]) throw new Error('Missing tx param');
            return provider.call(params[0]);
          case 'eth_getCode':
          case 'eth_getLogs':
          case 'eth_feeHistory':
          case 'eth_getBlockByNumber':
          case 'eth_getBlockByHash':
          case 'eth_getTransactionByHash':
          case 'eth_getStorageAt':
            return networkEngine.execute((p: any) => p.send(method, params));
        }
      } catch (err: any) {
        throw { code: -32000, message: `RPC Error (${method}): ${err.message}` };
      }
    }

    // 3. Write/Signing Methods (Require Approval)
    const writeMethods = [
      'eth_sendTransaction',
      'personal_sign',
      'eth_signTypedData_v4',
      'wallet_switchEthereumChain',
      'wallet_addEthereumChain'
    ];

    if (writeMethods.includes(method)) {
      this.checkRateLimit(origin, 'write');
      if (!PermissionController.hasPermission(origin)) {
        throw { code: 4100, message: 'Unauthorized' };
      }
      await ApprovalController.requestApproval(request);
      return 'PENDING_APPROVAL';
    }

    // 4. Unsupported Methods
    throw { code: -32601, message: `Method not found: ${method}` };
  }
}
