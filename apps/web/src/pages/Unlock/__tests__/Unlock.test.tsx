import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Unlock from '../index.js';
import { WalletContext } from '../../../contexts/WalletContext.js';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('Unlock Screen', () => {
  const mockUnlock = vi.fn();
  const mockGetSessionState = vi.fn().mockReturnValue({ lockoutUntil: null });

  const renderComponent = (overrides = {}) => {
    const defaultContext = {
      isLocked: true,
      hasVault: true,
      wallets: [],
      activeWalletId: null,
      activeAccountId: null,
      error: null,
      unlock: mockUnlock,
      createVault: vi.fn(),
      lock: vi.fn(),
      createWallet: vi.fn(),
      deriveAccount: vi.fn(),
      importWallet: vi.fn(),
      generateMnemonic: vi.fn(),
      validateMnemonic: vi.fn(),
      resetVault: vi.fn(),
      pingSession: vi.fn(),
      getSessionState: mockGetSessionState,
      setActiveWallet: vi.fn(),
      setActiveAccount: vi.fn(),
      ...overrides
    };

    return render(
      <WalletContext.Provider value={defaultContext}>
        <MemoryRouter>
          <Unlock />
        </MemoryRouter>
      </WalletContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSessionState.mockReturnValue({ lockoutUntil: null });
  });

  it('redirects to landing if no vault exists', () => {
    renderComponent({ hasVault: false });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('redirects to dashboard if already unlocked', () => {
    renderComponent({ isLocked: false });
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('allows unlocking with correct password', async () => {
    mockUnlock.mockResolvedValueOnce(undefined);
    renderComponent();

    const input = screen.getByLabelText(/password/i);
    fireEvent.change(input, { target: { value: 'correct-password' } });

    const btn = screen.getByRole('button', { name: /unlock vault/i });
    fireEvent.click(btn);

    expect(mockUnlock).toHaveBeenCalledWith('correct-password');

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error on incorrect password', async () => {
    mockUnlock.mockRejectedValueOnce(new Error('Incorrect password'));
    renderComponent();

    const input = screen.getByLabelText(/password/i);
    fireEvent.change(input, { target: { value: 'wrong-password' } });

    const btn = screen.getByRole('button', { name: /unlock vault/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getAllByText('Incorrect password').length).toBeGreaterThan(0);
    });

    // Password input should be cleared
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('shows cooldown warning when locked out', () => {
    mockGetSessionState.mockReturnValue({ lockoutUntil: Date.now() + 10000 });
    renderComponent();

    expect(screen.getByText(/too many attempts/i)).toBeTruthy();
    const btn = screen.getByRole('button', { name: /unlock vault/i });
    expect(btn).toHaveProperty('disabled', true);
  });
});
