import { createContext } from 'react';

export interface SafeAccount {
  id: string;
  address: string;
  name: string;
}

export interface AccountContextState {
  activeAccount: SafeAccount | null;
  accounts: SafeAccount[];
  error: Error | null;
}

export interface AccountContextActions {
  createAccount: () => Promise<void>;
}

export type AccountContextType = AccountContextState & AccountContextActions;

export const AccountContext = createContext<AccountContextType | null>(null);
