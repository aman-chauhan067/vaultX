import type { StorageInterface } from '../types/index.js';
import { TypedEventEmitter } from '../events/index.js';

export interface AddressBookEntry {
  id: string;
  address: string;
  name: string;
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'vaultx_address_book';

export class AddressBookController {
  private storage: StorageInterface;
  public events: TypedEventEmitter;
  private contacts: Record<string, AddressBookEntry> = {};

  public readonly DEFAULT_TAGS = [
    'Exchange',
    'Personal',
    'Business',
    'DeFi',
    'Bridge',
    'Cold Wallet',
    'Hardware Wallet',
    'Friend',
    'Family',
    'Contract',
    'Test',
    'Unknown'
  ];

  constructor(storage: StorageInterface) {
    this.storage = storage;
    this.events = new TypedEventEmitter();
  }

  public async load(): Promise<void> {
    const data = await this.storage.getItem(STORAGE_KEY);
    if (data) {
      try {
        this.contacts = JSON.parse(data);
      } catch {
        this.contacts = {};
      }
    }
  }

  private async save(): Promise<void> {
    await this.storage.setItem(STORAGE_KEY, JSON.stringify(this.contacts));
    this.events.emit('AddressBookUpdated');
  }

  public getContacts(): AddressBookEntry[] {
    return Object.values(this.contacts);
  }

  public addContact(
    address: string,
    name: string,
    tags: string[] = [],
    notes: string = ''
  ): AddressBookEntry {
    const normalizedAddress = address.toLowerCase();

    // Check for duplicates by address
    const existing = Object.values(this.contacts).find(
      (c) => c.address.toLowerCase() === normalizedAddress
    );
    if (existing) {
      throw new Error('Contact with this address already exists');
    }

    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    const contact: AddressBookEntry = {
      id,
      address,
      name,
      tags,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.contacts[id] = contact;
    this.save();
    return contact;
  }

  public updateContact(
    id: string,
    updates: Partial<Omit<AddressBookEntry, 'id' | 'createdAt'>>
  ): AddressBookEntry {
    if (!this.contacts[id]) {
      throw new Error(`Contact ${id} not found`);
    }

    this.contacts[id] = {
      ...this.contacts[id],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.save();
    return this.contacts[id];
  }

  public removeContact(id: string): void {
    if (this.contacts[id]) {
      delete this.contacts[id];
      this.save();
    }
  }

  public searchContacts(query: string): AddressBookEntry[] {
    const lowerQuery = query.toLowerCase();
    return Object.values(this.contacts).filter(
      (c) =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.address.toLowerCase().includes(lowerQuery) ||
        c.tags.some((t) => t.toLowerCase().includes(lowerQuery))
    );
  }
}
