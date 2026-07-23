import { VaultXService } from '@vaultx/web/src/services/VaultXService.js';
import type { WCSessionProposal, WCSessionRequest } from '@vaultx/network-engine';
import { ApprovalController } from './ApprovalController.js';

export class SessionController {
  public static async initialize(): Promise<void> {
    const projectId = 'b4f84c8a514d3f25c7ccb0a0344ed7ff'; // Normally from env, hardcoded for extension context if env not injected

    // In service worker, we must ensure WalletConnect is initialized
    try {
      const wcService = VaultXService.getInstance().walletConnect;
      await VaultXService.getInstance().initWalletConnect(projectId);

      wcService.on('session_proposal', this.onSessionProposal);
      wcService.on('session_request', this.onSessionRequest);
    } catch (err) {
      console.error('VaultX SessionController error:', err);
    }
  }

  private static onSessionProposal = async (proposal: WCSessionProposal) => {
    // Route WC proposal through the unified Approval Pipeline
    await ApprovalController.requestApproval({
      requestId: proposal.id.toString(),
      origin: proposal.proposer.url,
      method: 'wc_session_proposal',
      params: [proposal]
    });
  };

  private static onSessionRequest = async (request: WCSessionRequest) => {
    await ApprovalController.requestApproval({
      requestId: request.id.toString(),
      origin: request.topic, // topic as origin for WC requests
      chainId: parseInt(request.chainId.split(':')[1], 10),
      method: 'wc_session_request',
      params: [request]
    });
  };
}
