/**
 * @file events/index.ts
 * @description A lightweight, strictly-typed event emitter for internal state transitions.
 */

import type { AccountManagerEvents } from '../types/index.js';

export class TypedEventEmitter {
  private listeners: {
    [K in keyof AccountManagerEvents]?: Array<AccountManagerEvents[K]>;
  } = {};

  public on<K extends keyof AccountManagerEvents>(
    event: K,
    listener: AccountManagerEvents[K]
  ): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  public off<K extends keyof AccountManagerEvents>(
    event: K,
    listener: AccountManagerEvents[K]
  ): void {
    if (!this.listeners[event]) return;
    // @ts-expect-error TS cannot safely infer generic indexed assignment
    this.listeners[event] = this.listeners[event]!.filter((l) => l !== listener);
  }

  public emit<K extends keyof AccountManagerEvents>(
    event: K,
    ...args: Parameters<AccountManagerEvents[K]>
  ): void {
    if (!this.listeners[event]) return;
    for (const listener of this.listeners[event]!) {
      // @ts-expect-error Spread arguments match the parameters of the handler
      listener(...args);
    }
  }
}
