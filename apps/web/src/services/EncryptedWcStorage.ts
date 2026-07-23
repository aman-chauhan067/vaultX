import type { IKeyValueStorage } from '@walletconnect/keyvaluestorage';

export class EncryptedWcStorage implements IKeyValueStorage {
  private memoryCache = new Map<string, any>();
  private readonly STORAGE_PREFIX = 'vaultx_wc_';
  // A static key for demo purposes to avoid plaintext storage.
  // In a true production app, this key would be derived from the user's vault password
  // and passed in when the vault is unlocked.
  private static readonly ENCRYPTION_KEY_STRING = 'vaultx-secure-wc-key-256-bits!!';

  private async getCryptoKey(): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(EncryptedWcStorage.ENCRYPTION_KEY_STRING),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: enc.encode('vaultx-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  private async encrypt(data: string): Promise<string> {
    const key = await this.getCryptoKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(data);

    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

    const ivStr = Array.from(iv)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const cipherStr = Array.from(new Uint8Array(ciphertext))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return `${ivStr}:${cipherStr}`;
  }

  private async decrypt(payload: string): Promise<string> {
    const [ivStr, cipherStr] = payload.split(':');
    if (!ivStr || !cipherStr) throw new Error('Invalid payload');

    const iv = new Uint8Array(ivStr.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
    const ciphertext = new Uint8Array(
      cipherStr.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );

    const key = await this.getCryptoKey();
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);

    return new TextDecoder().decode(decrypted);
  }

  private async getStorageKeys(): Promise<string[]> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const data = await chrome.storage.local.get(null);
      return Object.keys(data);
    }
    const keys: string[] = [];
    if (typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) keys.push(k);
      }
    }
    return keys;
  }

  public async getKeys(): Promise<string[]> {
    const keys = await this.getStorageKeys();
    const filtered: string[] = [];
    for (const k of keys) {
      if (k.startsWith(this.STORAGE_PREFIX)) {
        filtered.push(k.substring(this.STORAGE_PREFIX.length));
      }
    }
    return filtered;
  }

  public async getEntries<T = any>(): Promise<[string, T][]> {
    const keys = await this.getKeys();
    const entries: [string, T][] = [];
    for (const key of keys) {
      const val = await this.getItem<T>(key);
      if (val) entries.push([key, val]);
    }
    return entries;
  }

  public async getItem<T = any>(key: string): Promise<T | undefined> {
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }
    let raw: string | null = null;
    const fullKey = this.STORAGE_PREFIX + key;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const data = await chrome.storage.local.get(fullKey);
      raw = data[fullKey] || null;
    } else if (typeof localStorage !== 'undefined') {
      raw = localStorage.getItem(fullKey);
    }
    if (!raw) return undefined;

    try {
      const decrypted = await this.decrypt(raw);
      const parsed = JSON.parse(decrypted);
      this.memoryCache.set(key, parsed);
      return parsed;
    } catch {
      return undefined;
    }
  }

  public async setItem<T = any>(key: string, value: T): Promise<void> {
    this.memoryCache.set(key, value);
    const serialized = JSON.stringify(value);
    const encrypted = await this.encrypt(serialized);
    const fullKey = this.STORAGE_PREFIX + key;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ [fullKey]: encrypted });
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(fullKey, encrypted);
    }
  }

  public async removeItem(key: string): Promise<void> {
    this.memoryCache.delete(key);
    const fullKey = this.STORAGE_PREFIX + key;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.remove(fullKey);
    } else if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(fullKey);
    }
  }
}
