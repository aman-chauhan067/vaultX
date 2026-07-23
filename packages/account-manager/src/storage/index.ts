/**
 * @file storage/index.ts
 * @description Implementations of the StorageInterface
 */

import type { StorageInterface } from '../types/index.js';

/**
 * An in-memory storage implementation for testing or transient usage.
 */
export class MemoryStorage implements StorageInterface {
  private store: Map<string, string> = new Map();

  public async getItem(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }

  public async setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  public async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }

  public async clear(): Promise<void> {
    this.store.clear();
  }
}

/**
 * A browser localStorage implementation.
 * Must be used in an environment where window.localStorage is defined.
 */
export class BrowserStorage implements StorageInterface {
  public async getItem(key: string): Promise<string | null> {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(key);
  }

  public async setItem(key: string, value: string): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(key, value);
  }

  public async removeItem(key: string): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.removeItem(key);
  }

  public async clear(): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.clear();
  }
}
