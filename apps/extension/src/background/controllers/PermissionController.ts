import { ExtensionStorage } from '../storage/ExtensionStorage.js';

export interface OriginPermission {
  origin: string;
  accounts: string[]; // Connected accounts
  grantedAt: number;
}

export class PermissionController {
  private static STORAGE_KEY = 'vaultx_permissions';
  private static permissions: Map<string, OriginPermission> = new Map();

  public static async initialize(): Promise<void> {
    const saved = await ExtensionStorage.get<Record<string, OriginPermission>>(
      this.STORAGE_KEY,
      {}
    );
    if (saved) {
      Object.values(saved).forEach((p) => this.permissions.set(p.origin, p));
    }
  }

  public static hasPermission(origin: string): boolean {
    return this.permissions.has(origin);
  }

  public static getAccountsForOrigin(origin: string): string[] {
    const perm = this.permissions.get(origin);
    return perm ? perm.accounts : [];
  }

  public static async grantPermission(origin: string, accounts: string[]): Promise<void> {
    const perm: OriginPermission = {
      origin,
      accounts,
      grantedAt: Date.now()
    };
    this.permissions.set(origin, perm);
    await this.persist();
  }

  public static async revokePermission(origin: string): Promise<void> {
    if (this.permissions.has(origin)) {
      this.permissions.delete(origin);
      await this.persist();
    }
  }

  public static async clearAll(): Promise<void> {
    this.permissions.clear();
    await this.persist();
  }

  private static async persist(): Promise<void> {
    const data: Record<string, OriginPermission> = {};
    this.permissions.forEach((v, k) => {
      data[k] = v;
    });
    await ExtensionStorage.set(this.STORAGE_KEY, data);
  }
}
