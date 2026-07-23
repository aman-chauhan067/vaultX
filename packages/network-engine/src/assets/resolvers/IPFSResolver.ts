export class IPFSResolver {
  private gateways: string[];
  private defaultGateway: string;

  constructor(customGateways?: string[]) {
    // Cloudflare IPFS gateway as default, with fallback to standard ipfs.io
    const envGateway =
      typeof process !== 'undefined' && process.env && process.env.VAULTX_IPFS_GATEWAY;
    this.defaultGateway = envGateway || 'https://cloudflare-ipfs.com/ipfs/';

    this.gateways = customGateways || [this.defaultGateway, 'https://ipfs.io/ipfs/'];
  }

  /**
   * Resolves an IPFS URI to an HTTP gateway URL.
   * Also normalizes ipfs:// protocol if present.
   */
  public resolve(uri: string): string {
    if (!uri) return '';

    // Some NFTs incorrectly format their IPFS URIs as "ipfs://ipfs/HASH"
    if (uri.startsWith('ipfs://ipfs/')) {
      return uri.replace('ipfs://ipfs/', this.defaultGateway);
    }

    if (uri.startsWith('ipfs://')) {
      return uri.replace('ipfs://', this.defaultGateway);
    }

    // Handle bare CIDs (heuristic length check for base58/b32 CIDv0 or CIDv1)
    if ((uri.startsWith('Qm') || uri.startsWith('bafy')) && !uri.includes('://')) {
      return `${this.defaultGateway}${uri}`;
    }

    return uri;
  }
}
