/**
 * @file events/index.ts
 * @description Typed event emitter for network-engine internal transitions.
 */

import type { NetworkEvents } from '../types/index.js';

export class NetworkEventEmitter {
  private listeners: {
    [K in keyof NetworkEvents]?: Array<NetworkEvents[K]>;
  } = {};

  public on<K extends keyof NetworkEvents>(event: K, listener: NetworkEvents[K]): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  public off<K extends keyof NetworkEvents>(event: K, listener: NetworkEvents[K]): void {
    if (!this.listeners[event]) return;
    // @ts-expect-error TS cannot safely infer generic indexed assignment
    this.listeners[event] = this.listeners[event]!.filter((l) => l !== listener);
  }

  public emit<K extends keyof NetworkEvents>(
    event: K,
    ...args: Parameters<NetworkEvents[K]>
  ): void {
    if (!this.listeners[event]) return;
    for (const listener of this.listeners[event]!) {
      // @ts-expect-error Spread arguments match the parameters of the handler
      listener(...args);
    }
  }
}
