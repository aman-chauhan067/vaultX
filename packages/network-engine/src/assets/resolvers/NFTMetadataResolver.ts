import { IPFSResolver } from './IPFSResolver.js';
import type { NFTMetadata, NFTMetadataState } from './types.js';

export class NFTMetadataResolver {
  private ipfsResolver: IPFSResolver;
  // Maximum response size for safety (1 MB = 1048576 bytes)
  private readonly MAX_RESPONSE_SIZE = 1048576;
  private readonly TIMEOUT_MS = 5000;

  constructor(ipfsResolver?: IPFSResolver) {
    this.ipfsResolver = ipfsResolver || new IPFSResolver();
  }

  /**
   * Fetches metadata JSON securely.
   * Enforces timeout and max response size.
   */
  public async resolveMetadata(
    uri: string
  ): Promise<{ state: NFTMetadataState; metadata: NFTMetadata }> {
    if (!uri) {
      return { state: 'failed', metadata: {} };
    }

    const httpUrl = this.ipfsResolver.resolve(uri);

    // Sometimes URIs are data URIs directly
    if (httpUrl.startsWith('data:application/json')) {
      try {
        const parts = httpUrl.split(',');
        if (parts.length > 1 && typeof parts[1] === 'string') {
          // It could be base64 or url-encoded
          const dataStr = parts[1] as string;
          const content = httpUrl.includes(';base64')
            ? typeof atob !== 'undefined'
              ? atob(dataStr)
              : Buffer.from(dataStr, 'base64').toString('utf-8')
            : decodeURIComponent(dataStr);
          return { state: 'loaded', metadata: this.parseSafeJson(content) };
        }
      } catch (err) {
        return { state: 'failed', metadata: {} };
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      // Prevent fetch if it's still IPFS and not resolved (meaning no gateway worked)
      if (!httpUrl.startsWith('http')) {
        return { state: 'failed', metadata: {} };
      }

      const response = await fetch(httpUrl, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        return { state: 'failed', metadata: {} };
      }

      // Read response size safely before parsing fully if Content-Length is provided
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength, 10) > this.MAX_RESPONSE_SIZE) {
        console.warn(`[NFTMetadataResolver] Rejected oversized metadata from ${httpUrl}`);
        return { state: 'failed', metadata: {} };
      }

      // Stream the response to ensure we don't exceed max size if Content-Length is missing
      const text = await this.readStreamSafely(response.body);
      const metadata = this.parseSafeJson(text);

      return { state: 'loaded', metadata: this.normalizeMetadataFields(metadata) };
    } catch (err) {
      // Timeout, network error, or oversize throw
      return { state: 'failed', metadata: {} };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async readStreamSafely(body: ReadableStream<Uint8Array> | null): Promise<string> {
    if (!body) return '';
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let result = '';
    let bytesRead = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        bytesRead += value.length;
        if (bytesRead > this.MAX_RESPONSE_SIZE) {
          reader.cancel();
          throw new Error('Response size exceeded 1MB limit');
        }
        result += decoder.decode(value, { stream: true });
      }
    }
    result += decoder.decode(); // flush
    return result;
  }

  private parseSafeJson(content: string): any {
    try {
      // Some metadata has trailing commas or weird invisible chars
      return JSON.parse(content.trim());
    } catch (e) {
      return {};
    }
  }

  /**
   * Normalizes the image field, looking at common aliases like image_url, animation_url
   * and normalizes the IPFS URLs inside them.
   */
  private normalizeMetadataFields(metadata: any): NFTMetadata {
    const norm: NFTMetadata = { ...metadata };

    // Find image
    const rawImage = norm.image || norm.image_url || norm.animation_url || norm.external_url || '';
    if (rawImage) {
      norm.image = this.ipfsResolver.resolve(rawImage);
    } else {
      norm.image = '';
    }

    return norm;
  }
}
