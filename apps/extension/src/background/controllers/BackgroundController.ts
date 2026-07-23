import { ExtensionStorage } from '../storage/ExtensionStorage.js';
import { SecurityGuard } from '../security/SecurityGuard.js';
import { RequestQueue } from '../RequestQueue.js';
import { PermissionController } from './PermissionController.js';
import { ProviderController } from './ProviderController.js';
import { SessionController } from './SessionController.js';
import { RpcController } from './RpcController.js';
import { ApprovalController } from './ApprovalController.js';
import { ResponseTracker } from '../ResponseTracker.js';
import type {
  ExtensionMessage,
  ExtensionResponse,
  ProviderRequest
} from '../../messaging/types.js';

export class BackgroundController {
  private static initPromise: Promise<void> | null = null;
  public static pendingResponses = new Map<string, (res: ExtensionResponse) => void>();

  public static initialize(): Promise<void> {
    if (!this.initPromise) {
      // Bind Message Listener synchronously to satisfy MV3 requirements
      chrome.runtime.onMessage.addListener(this.onMessage);

      this.initPromise = (async () => {
        // Boot up state
        await PermissionController.initialize();
        await RequestQueue.initialize();

        // Wire up providers and external connections
        ProviderController.initialize();
        await SessionController.initialize();

        // Attempt to process any queued requests that survived restart
        ApprovalController.startGC();
        ApprovalController.processQueue();
      })();
    }
    return this.initPromise;
  }

  private static onMessage = (
    request: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (res: ExtensionResponse) => void
  ) => {
    // 1. Security Validation
    if (!SecurityGuard.validateIncomingMessage(request, sender)) {
      sendResponse({ id: request.id, success: false, error: 'Security validation failed' });
      return false; // synchronous reject
    }

    // 2. Handle Message Asynchronously
    const handle = async () => {
      try {
        await BackgroundController.initPromise;

        if (request.type === 'RPC_REQUEST') {
          // Construct full provider request
          const providerReq: ProviderRequest = {
            requestId: request.id,
            origin: sender.origin || 'unknown',
            tabId: sender.tab?.id,
            frameId: sender.frameId,
            createdAt: Date.now(),
            expiresAt: Date.now() + 5 * 60 * 1000,
            method: request.payload.method,
            params: request.payload.params || [],
            status: 'Created'
          };

          const result = await RpcController.handleRpcRequest(providerReq);

          if (result === 'PENDING_APPROVAL') {
            ResponseTracker.set(request.id, sendResponse);
          } else {
            sendResponse({ id: request.id, success: true, data: result });
          }
        } else if (request.type === 'GET_PENDING_REQUEST') {
          // Used by the Popup UI to fetch the currently displayed request
          const active = RequestQueue.getActiveRequest();
          sendResponse({
            id: request.id,
            success: true,
            data: active?.status === 'Displayed' ? active : null
          });
        } else if (request.type === 'SET_PASSWORD') {
          (globalThis as any).vaultxPassword = request.payload.password;
          sendResponse({ id: request.id, success: true });
        } else if (request.type === 'GET_PASSWORD') {
          sendResponse({ id: request.id, success: true, data: (globalThis as any).vaultxPassword });
        } else if (request.type === 'RESOLVE_REQUEST') {
          // Called by Popup UI
          console.log(
            `[BackgroundController] Received RESOLVE_REQUEST for requestId ${request.payload.requestId}`
          );
          await ApprovalController.resolveApproval(
            request.payload.requestId,
            request.payload.result
          );
          sendResponse({ id: request.id, success: true });
        } else if (request.type === 'REJECT_REQUEST') {
          // Called by Popup UI
          console.log(
            `[BackgroundController] Received REJECT_REQUEST for requestId ${request.payload.requestId}`
          );
          await ApprovalController.rejectApproval(
            request.payload.requestId,
            request.payload.reason
          );
          sendResponse({ id: request.id, success: true });
        } else {
          throw new Error(`Unknown message type: ${request.type}`);
        }
      } catch (err: any) {
        console.error(`VaultX Background Error:`, err);
        sendResponse({ id: request.id, success: false, error: err.message });
      }
    };

    handle();
    return true; // Keep channel open for async response
  };
}
