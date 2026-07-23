/**
 * @file state/index.ts
 * @description Transaction Status State Machine
 */

export enum TransactionState {
  CREATED = 'Created',
  VALIDATED = 'Validated',
  READY = 'Ready',
  SIGNING = 'Signing',
  SIGNED = 'Signed',
  BROADCASTING = 'Broadcasting',
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  FAILED = 'Failed',
  DROPPED = 'Dropped',
  REPLACED = 'Replaced',
  CANCELLED = 'Cancelled'
}

export type StateChangeListener = (
  previous: TransactionState,
  current: TransactionState,
  data?: unknown
) => void;

export class TransactionStateMachine {
  private state: TransactionState = TransactionState.CREATED;
  private listeners: StateChangeListener[] = [];

  public getState(): TransactionState {
    return this.state;
  }

  public transition(newState: TransactionState, data?: unknown): void {
    const validTransitions: Record<TransactionState, TransactionState[]> = {
      [TransactionState.CREATED]: [TransactionState.VALIDATED, TransactionState.FAILED],
      [TransactionState.VALIDATED]: [TransactionState.READY, TransactionState.FAILED],
      [TransactionState.READY]: [
        TransactionState.SIGNING,
        TransactionState.CANCELLED,
        TransactionState.FAILED
      ],
      [TransactionState.SIGNING]: [TransactionState.SIGNED, TransactionState.FAILED],
      [TransactionState.SIGNED]: [
        TransactionState.BROADCASTING,
        TransactionState.CANCELLED,
        TransactionState.FAILED
      ],
      [TransactionState.BROADCASTING]: [TransactionState.PENDING, TransactionState.FAILED],
      [TransactionState.PENDING]: [
        TransactionState.CONFIRMED,
        TransactionState.DROPPED,
        TransactionState.REPLACED,
        TransactionState.CANCELLED,
        TransactionState.FAILED
      ],
      [TransactionState.CONFIRMED]: [],
      [TransactionState.FAILED]: [],
      [TransactionState.DROPPED]: [],
      [TransactionState.REPLACED]: [],
      [TransactionState.CANCELLED]: []
    };

    if (!validTransitions[this.state].includes(newState)) {
      throw new Error(`Invalid state transition from ${this.state} to ${newState}`);
    }

    const previous = this.state;
    this.state = newState;

    for (const listener of this.listeners) {
      listener(previous, this.state, data);
    }
  }

  public onTransition(listener: StateChangeListener): void {
    this.listeners.push(listener);
  }
}
