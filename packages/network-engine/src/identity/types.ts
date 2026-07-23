export interface IdentityProfile {
  address: string;
  name: string | null;
  avatar: string | null;
  resolver: string; // e.g. "ENS", "Lens", "Unstoppable"
}

export interface IIdentityResolver {
  readonly name: string;
  readonly supportedChainIds: number[];

  /**
   * Resolves a human-readable name to an address.
   */
  resolveName(name: string, provider: any): Promise<string | null>;

  /**
   * Looks up the primary human-readable name for an address.
   */
  lookupAddress(address: string, provider: any): Promise<string | null>;

  /**
   * Fetches the avatar URL for a given name.
   */
  getAvatar(name: string, provider: any): Promise<string | null>;
}
