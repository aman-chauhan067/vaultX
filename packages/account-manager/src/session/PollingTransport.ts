import { SessionTransport } from './SessionTransport.js';

export class PollingTransport implements SessionTransport {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly baseUrl: string;
  private readonly intervalMs: number;

  constructor(baseUrl: string, intervalMs: number = 10000) {
    this.baseUrl = baseUrl;
    this.intervalMs = intervalMs;
  }

  start(deviceId: string, onRevoked: () => void): void {
    this.stop();

    this.intervalId = setInterval(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/sessions/${deviceId}/status`);
        if (!response.ok) return;
        const data = await response.json();
        if (data.status === 'revoked') {
          this.stop();
          onRevoked();
        }
      } catch (e) {
        // Silently fail on network error, keep polling
      }
    }, this.intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
