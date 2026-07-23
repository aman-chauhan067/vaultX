import type { ProviderRequest } from '../messaging/types.js';
import { ExtensionStorage } from './storage/ExtensionStorage.js';

export class RequestQueue {
  private static STORAGE_KEY = 'vaultx_request_queue';
  private static queue: ProviderRequest[] = [];
  private static readonly MAX_QUEUE_SIZE = 50;

  public static async initialize() {
    const saved = await ExtensionStorage.get<ProviderRequest[]>(this.STORAGE_KEY, []);
    // Filter out expired or completed requests during boot
    const now = Date.now();
    this.queue =
      saved?.filter(
        (r) => ['Created', 'Queued', 'Displayed'].includes(r.status) && r.expiresAt > now
      ) || [];

    // Any request that was "Displayed" when browser closed is now returned to "Queued"
    this.queue.forEach((r) => {
      if (r.status === 'Displayed') {
        r.status = 'Queued';
      }
    });

    await this.persist();
  }

  public static async enqueue(request: ProviderRequest): Promise<void> {
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      throw { code: -32000, message: 'Request queue is full' };
    }
    this.queue.push(request);
    await this.persist();
  }

  public static async dequeue(): Promise<ProviderRequest | undefined> {
    const req = this.queue.shift();
    await this.persist();
    return req;
  }

  public static getActiveRequest(): ProviderRequest | undefined {
    return this.queue.length > 0 ? this.queue[0] : undefined;
  }

  public static async updateRequestStatus(
    requestId: string,
    status: ProviderRequest['status']
  ): Promise<void> {
    const req = this.queue.find((r) => r.requestId === requestId);
    if (req) {
      req.status = status;

      // If it's a terminal state, remove it from queue
      if (
        ['Approved', 'Rejected', 'TimedOut', 'Cancelled', 'Completed', 'Failed'].includes(status)
      ) {
        this.queue = this.queue.filter((r) => r.requestId !== requestId);
      }

      await this.persist();
    }
  }

  public static async getRequestById(requestId: string): Promise<ProviderRequest | undefined> {
    return this.queue.find((r) => r.requestId === requestId);
  }

  public static getQueueLength(): number {
    return this.queue.length;
  }

  public static async removeExpired(): Promise<void> {
    const now = Date.now();
    const initialLength = this.queue.length;
    this.queue = this.queue.filter((r) => r.expiresAt > now);

    if (this.queue.length !== initialLength) {
      await this.persist();
    }
  }

  private static async persist(): Promise<void> {
    await ExtensionStorage.set(this.STORAGE_KEY, this.queue);
  }
}
