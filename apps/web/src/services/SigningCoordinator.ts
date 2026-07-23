import { VaultXService } from './VaultXService.js';
import { VaultXProviderAdapter } from './VaultXProviderAdapter.js';
import { BlockchainFactory } from '@vaultx/blockchain-core';
import { TransactionExecutor } from '@vaultx/transaction-engine';
import { isHexString, getBytes } from 'ethers';

export class SigningCoordinator {
  private static instance: SigningCoordinator;

  private constructor() {}

  public static getInstance(): SigningCoordinator {
    if (!SigningCoordinator.instance) {
      SigningCoordinator.instance = new SigningCoordinator();
    }
    return SigningCoordinator.instance;
  }

  /**
   * Dispatches the signing request to the appropriate handler
   */
  public async handleWalletConnectRequest(
    method: string,
    params: any[],
    chainId: string
  ): Promise<any> {
    return this.routeRequest(method, params, chainId);
  }

  /**
   * Dispatches Extension RPC Requests
   */
  public async handleExtensionRequest(
    method: string,
    params: any[],
    chainId?: string
  ): Promise<any> {
    return this.routeRequest(method, params, chainId);
  }

  private async routeRequest(method: string, params: any[], chainId?: string): Promise<any> {
    console.log('[SigningCoordinator] Routing request:', method, params);
    switch (method) {
      case 'eth_requestAccounts':
      case 'wallet_requestPermissions': {
        const activeWallet = VaultXService.getInstance().accountManager.getActiveWallet();
        if (!activeWallet) {
          console.error('[SigningCoordinator] No active wallet found in routeRequest for', method);
        }
        return activeWallet ? [activeWallet.address] : [];
      }
      case 'personal_sign':
        return this.signPersonalMessage(params);
      case 'eth_signTypedData_v4':
        return this.signTypedData(params);
      case 'eth_sendTransaction':
        return this.sendTransaction(params[0], chainId);
      case 'eth_sign':
        throw new Error('eth_sign is insecure and disabled.');
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }

  private async getActiveSigner() {
    const activeWallet = VaultXService.getInstance().accountManager.getActiveWallet();
    if (!activeWallet) throw new Error('No active wallet found');
    if (!activeWallet.privateKey) throw new Error('Wallet is read-only or locked');
    const provider = new VaultXProviderAdapter(VaultXService.getInstance().networkEngine);
    return BlockchainFactory.createSigner(activeWallet.privateKey, provider);
  }

  private async signPersonalMessage(params: any[]): Promise<string> {
    const message = params[0];
    const signer = await this.getActiveSigner();

    let messageBytes: string | Uint8Array = message;
    if (isHexString(message)) {
      messageBytes = getBytes(message);
    }

    return signer.signMessage(messageBytes);
  }

  private async signTypedData(params: any[]): Promise<string> {
    const typedDataStr = typeof params[1] === 'string' ? params[1] : JSON.stringify(params[1]);
    const typedData = JSON.parse(typedDataStr);

    const signer = await this.getActiveSigner();
    return signer.signTypedData(typedData.domain, typedData.types, typedData.message);
  }

  private async sendTransaction(txParam: any, chainId?: string): Promise<string> {
    const activeWallet = VaultXService.getInstance().accountManager.getActiveWallet();
    if (!activeWallet) throw new Error('No active wallet found');

    const txEngine = VaultXService.getInstance().transactionEngine;
    if (!txEngine) throw new Error('Transaction engine not available');

    const provider = new VaultXProviderAdapter(VaultXService.getInstance().networkEngine);
    if (!activeWallet.privateKey) throw new Error('Wallet is read-only or locked');
    const signer = BlockchainFactory.createSigner(activeWallet.privateKey, provider);

    const request: any = {
      from: activeWallet.address,
      to: txParam.to,
      value: txParam.value || '0x0',
      data: txParam.data || '0x'
    };

    if (chainId) {
      request.chainId = parseInt(chainId.replace('eip155:', ''), 10);
    } else {
      request.chainId = VaultXService.getInstance().networkEngine.getActiveChainId()!;
    }

    if (txParam.gasLimit || txParam.gas) request.gasLimit = txParam.gasLimit || txParam.gas;
    if (txParam.gasPrice) request.gasPrice = txParam.gasPrice;

    // Use TransactionCoordinator (Phase 2 abstraction)
    const prepared = await txEngine.prepareTransaction(request, provider);
    const executor = new TransactionExecutor(prepared, { provider, signer });
    const receipt = await executor.execute();
    return receipt.transactionHash;
  }
}
