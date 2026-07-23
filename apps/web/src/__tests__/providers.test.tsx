import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider } from '../providers/AppProvider.js';
import { useWallet, useNetwork, useTransactions } from '../hooks/index.js';
import { VaultXService } from '../services/VaultXService.js';

// Component to test hooks
const TestComponent = () => {
  const { hasVault, isLocked, createVault, unlock, lock, error } = useWallet();
  const { switchNetwork, activeChainId } = useNetwork();
  // Call useTransactions just to ensure context is available
  useTransactions();

  return (
    <div>
      <div data-testid="vault-status">{hasVault ? 'HasVault' : 'NoVault'}</div>
      <div data-testid="lock-status">{isLocked ? 'Locked' : 'Unlocked'}</div>
      <div data-testid="error-status">{error ? error.message : 'NoError'}</div>
      <div data-testid="network-status">{activeChainId || 'None'}</div>

      <button onClick={() => createVault('Password123!')}>CreateVault</button>
      <button onClick={() => unlock('Password123!')}>Unlock</button>
      <button onClick={lock}>Lock</button>
      <button onClick={() => switchNetwork(1)}>SwitchNetwork</button>
    </div>
  );
};

describe('React Integration Layer', () => {
  beforeEach(async () => {
    // Clear storage before each test
    localStorage.clear();
    VaultXService.getInstance();
  });

  it('initializes context and handles wallet creation', async () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    // Initial state: no vault, locked
    expect((await screen.findByTestId('vault-status')).textContent).toBe('NoVault');
    expect(screen.getByTestId('lock-status').textContent).toBe('Locked');

    // Create vault
    fireEvent.click(screen.getByText('CreateVault'));

    // Should become HasVault and Unlocked
    await waitFor(
      () => {
        expect(screen.getByTestId('vault-status').textContent).toBe('HasVault');
        expect(screen.getByTestId('lock-status').textContent).toBe('Unlocked');
      },
      { timeout: 5000 }
    );

    // Lock vault
    fireEvent.click(screen.getByText('Lock'));
    await waitFor(() => {
      expect(screen.getByTestId('lock-status').textContent).toBe('Locked');
    });

    // Unlock vault
    fireEvent.click(screen.getByText('Unlock'));
    await waitFor(
      () => {
        expect(screen.getByTestId('lock-status').textContent).toBe('Unlocked');
      },
      { timeout: 5000 }
    );
  }, 15000);

  it('handles network switching correctly', async () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    // Initial network
    await waitFor(() => {
      expect(screen.getByTestId('network-status').textContent).toBe('None');
    });

    // Switch network
    fireEvent.click(screen.getByText('SwitchNetwork'));

    // Network should switch to 1 (Ethereum Mainnet)
    await waitFor(() => {
      expect(screen.getByTestId('network-status').textContent).toBe('1');
    });
  });
});
