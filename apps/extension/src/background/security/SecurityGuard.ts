import type { ExtensionMessage } from '../../messaging/types.js';

export class SecurityGuard {
  private static MAX_PAYLOAD_SIZE = 10 * 1024; // 10KB

  // Basic rate limiting map
  private static requestCounts = new Map<string, { count: number; timestamp: number }>();
  private static RATE_LIMIT_WINDOW = 60000; // 1 minute
  private static MAX_REQUESTS_PER_WINDOW = 100;

  /**
   * Validates an incoming message for origin, size, and rate limits
   */
  public static validateIncomingMessage(
    request: ExtensionMessage,
    sender: chrome.runtime.MessageSender
  ): boolean {
    // 1. Origin validation
    if (!sender.origin || sender.origin === 'null') {
      console.warn('VaultX Security: Rejected message with missing or null origin');
      return false;
    }

    // Must be HTTP/HTTPS/FILE or extension internal
    if (
      !sender.origin.startsWith('http') &&
      !sender.origin.startsWith('chrome-extension') &&
      !sender.origin.startsWith('file://')
    ) {
      console.warn(
        `VaultX Security: Rejected message from unsupported origin protocol: ${sender.origin}`
      );
      return false;
    }

    // 2. Payload size check
    if (request.payload) {
      const payloadString = JSON.stringify(request.payload);
      if (payloadString.length > this.MAX_PAYLOAD_SIZE) {
        console.warn(`VaultX Security: Rejected oversized payload from ${sender.origin}`);
        return false;
      }
    }

    // 3. Rate limiting
    const now = Date.now();
    const rateData = this.requestCounts.get(sender.origin) || { count: 0, timestamp: now };

    if (now - rateData.timestamp > this.RATE_LIMIT_WINDOW) {
      // Reset window
      rateData.count = 1;
      rateData.timestamp = now;
    } else {
      rateData.count++;
      if (rateData.count > this.MAX_REQUESTS_PER_WINDOW) {
        console.warn(`VaultX Security: Rate limit exceeded for ${sender.origin}`);
        return false;
      }
    }
    this.requestCounts.set(sender.origin, rateData);

    return true;
  }
}
