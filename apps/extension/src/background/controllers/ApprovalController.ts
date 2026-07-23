import { RequestQueue } from '../RequestQueue.js';
import { WindowController } from './WindowController.js';
import { PermissionController } from './PermissionController.js';
import type { ProviderRequest } from '../../messaging/types.js';
import { ResponseTracker } from '../ResponseTracker.js';

export class ApprovalController {
  private static gcTimer: ReturnType<typeof setInterval> | null = null;

  public static startGC() {
    if (this.gcTimer) return;
    this.gcTimer = setInterval(() => {
      this.processQueue();
    }, 60 * 1000); // Check every minute
  }

  public static stopGC() {
    if (this.gcTimer) {
      clearInterval(this.gcTimer);
      this.gcTimer = null;
    }
  }

  /**
   * Main entry point to request user approval.
   * Queues the request and attempts to display the window if it's the only one.
   */
  public static async requestApproval(
    request: Omit<ProviderRequest, 'status' | 'createdAt' | 'expiresAt'>
  ): Promise<string> {
    const fullRequest: ProviderRequest = {
      ...request,
      status: 'Created',
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minute timeout
    };

    await RequestQueue.enqueue(fullRequest);

    // Process the queue asynchronously
    this.processQueue();

    return request.requestId;
  }

  /**
   * Processes the queue in FIFO order.
   * If there's an active displayed request, it waits.
   * Otherwise, it picks the next queued request and displays it.
   */
  public static async processQueue(): Promise<void> {
    await RequestQueue.removeExpired();

    const active = RequestQueue.getActiveRequest();
    if (!active) return;

    if (active.status === 'Displayed') {
      // Window is already open and showing this request
      // Make sure the window is focused
      await WindowController.spawnPopup('/approve');
      return;
    }

    if (active.status === 'Created' || active.status === 'Queued') {
      await RequestQueue.updateRequestStatus(active.requestId, 'Displayed');
      await WindowController.spawnPopup('/approve');
    }
  }

  /**
   * Called by the UI when the user approves
   */
  public static async resolveApproval(requestId: string, result: any): Promise<void> {
    console.log(`[ApprovalController] resolveApproval called for ${requestId} with result`, result);
    const req = await RequestQueue.getRequestById(requestId);
    if (!req) {
      console.log(`[ApprovalController] Request ${requestId} not found in queue!`);
      return;
    }

    req.result = result;
    await RequestQueue.updateRequestStatus(requestId, 'Approved');

    // Persist permissions if this was a connection request
    if (req.method === 'eth_requestAccounts' || req.method === 'wallet_requestPermissions') {
      const accounts = Array.isArray(result) ? result : [result];
      await PermissionController.grantPermission(req.origin, accounts);
    }

    const sendResponse = ResponseTracker.get(requestId);
    console.log(`[ApprovalController] Found sendResponse for ${requestId}?`, !!sendResponse);
    if (sendResponse) {
      sendResponse({ id: requestId, success: true, data: result });
      ResponseTracker.delete(requestId);
    } else {
      // SW was restarted – push result directly to the tab that originated the request
      console.log(
        `[ApprovalController] Pushing result via tabs.sendMessage for tabId ${req.tabId}`
      );
      if (req.tabId !== undefined) {
        try {
          await chrome.tabs.sendMessage(req.tabId, {
            type: 'VAULTX_PUSH_RESPONSE',
            id: requestId,
            payload: { id: requestId, success: true, data: result }
          });
        } catch (e) {
          console.error('[ApprovalController] tabs.sendMessage failed:', e);
        }
      }
    }

    // Move to the next item
    await this.processQueue();
  }

  /**
   * Called by the UI when the user rejects
   */
  public static async rejectApproval(requestId: string, reason: string): Promise<void> {
    const req = await RequestQueue.getRequestById(requestId);
    if (!req) return;

    req.error = reason;
    await RequestQueue.updateRequestStatus(requestId, 'Rejected');

    // Notify the pending caller
    const sendResponse = ResponseTracker.get(requestId);
    if (sendResponse) {
      sendResponse({ id: requestId, success: false, error: reason });
      ResponseTracker.delete(requestId);
    } else if (req.tabId !== undefined) {
      // SW was restarted – push rejection directly to the tab
      try {
        await chrome.tabs.sendMessage(req.tabId, {
          type: 'VAULTX_PUSH_RESPONSE',
          id: requestId,
          payload: { id: requestId, success: false, error: reason }
        });
      } catch (e) {
        console.error('[ApprovalController] tabs.sendMessage (reject) failed:', e);
      }
    }

    // Move to next item
    await this.processQueue();
  }
}
