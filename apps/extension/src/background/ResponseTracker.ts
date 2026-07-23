import type { ExtensionResponse } from '../messaging/types.js';

export class ResponseTracker {
  private static pendingResponses = new Map<string, (res: ExtensionResponse) => void>();

  public static set(id: string, callback: (res: ExtensionResponse) => void) {
    this.pendingResponses.set(id, callback);
  }

  public static get(id: string) {
    return this.pendingResponses.get(id);
  }

  public static delete(id: string) {
    this.pendingResponses.delete(id);
  }
}
