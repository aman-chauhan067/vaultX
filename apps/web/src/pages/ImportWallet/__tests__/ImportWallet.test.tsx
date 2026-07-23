import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ImportWallet from '../index.js';
import { WalletContext } from '../../../contexts/WalletContext.js';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe.skip('ImportWallet Component', () => {
  const mockCreateVault = vi.fn();
  const mockCreateWallet = vi.fn();
  const mockValidateMnemonic = vi.fn();
  const mockUnlock = vi.fn();
  const mockSetActiveWallet = vi.fn();
  const mockSetActiveAccount = vi.fn();
  const mockGenerateMnemonic = vi.fn();
  const mockLock = vi.fn();

  const renderWithProvider = (hasVault: boolean, isLocked: boolean) => {
    return render(
      <WalletContext.Provider
        value={{
          isLocked,
          hasVault,
          wallets: [],
          activeWalletId: null,
          activeAccountId: null,
          error: null,
          unlock: mockUnlock,
          createVault: mockCreateVault,
          lock: mockLock,
          createWallet: mockCreateWallet,
          deriveAccount: vi.fn(),
          importWallet: vi.fn(),
          generateMnemonic: mockGenerateMnemonic,
          validateMnemonic: mockValidateMnemonic,
          resetVault: vi.fn(),
          pingSession: vi.fn(),
          getSessionState: vi.fn().mockReturnValue({}),
          setActiveWallet: mockSetActiveWallet,
          setActiveAccount: mockSetActiveAccount
        }}
      >
        <ImportWallet />
      </WalletContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockValidateMnemonic.mockReturnValue(true);
  });

  it('navigates back to home on cancel', () => {
    renderWithProvider(false, true);

    expect(screen.getByText('Import Wallet')).toBeTruthy();

    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('handles invalid mnemonic phrase', async () => {
    mockValidateMnemonic.mockReturnValue(false);
    renderWithProvider(false, true);

    fireEvent.click(screen.getByText('Continue'));

    // Fill only a few words to trigger empty error
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(12);

    fireEvent.change(inputs[0]!, { target: { value: 'test' } });
    fireEvent.click(screen.getByText('Verify Phrase'));

    expect(screen.getByText('Please fill in all 12 words.')).toBeTruthy();

    // Fill all words but make it invalid
    for (let i = 0; i < 12; i++) {
      fireEvent.change(inputs[i]!, { target: { value: 'word' } });
    }

    fireEvent.click(screen.getByText('Verify Phrase'));
    expect(
      screen.getByText('Invalid recovery phrase. Please check your spelling and word order.')
    ).toBeTruthy();
  });

  it('completes the flow without existing vault', async () => {
    renderWithProvider(false, true);

    fireEvent.click(screen.getByText('Continue'));

    const inputs = screen.getAllByRole('textbox');
    for (let i = 0; i < 12; i++) {
      fireEvent.change(inputs[i]!, { target: { value: 'word' } });
    }

    fireEvent.click(screen.getByText('Verify Phrase'));

    await waitFor(() => {
      expect(screen.getByText('Create Password')).toBeTruthy();
    });

    const passInputs = screen.getAllByPlaceholderText(/password/i);
    expect(passInputs).toHaveLength(2); // New and Confirm

    fireEvent.change(passInputs[0]!, { target: { value: 'Test1234!' } });
    fireEvent.change(passInputs[1]!, { target: { value: 'Test1234!' } });

    const encryptBtn = screen.getByText('Encrypt & Import');
    fireEvent.click(encryptBtn);

    await waitFor(() => {
      expect(mockCreateVault).toHaveBeenCalledWith('Test1234!');
      expect(mockCreateWallet).toHaveBeenCalledWith(
        'word word word word word word word word word word word word',
        'Imported Wallet'
      );
    });

    expect(screen.getByText('Wallet Imported!')).toBeTruthy();

    fireEvent.click(screen.getByText('Go to Dashboard'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('completes the flow with existing unlocked vault', async () => {
    renderWithProvider(true, false); // hasVault = true, isLocked = false

    fireEvent.click(screen.getByText('Continue'));

    const inputs = screen.getAllByRole('textbox');
    for (let i = 0; i < 12; i++) {
      fireEvent.change(inputs[i]!, { target: { value: 'test' } });
    }

    fireEvent.click(screen.getByText('Verify Phrase'));

    // It should skip password entirely
    await waitFor(() => {
      expect(mockCreateWallet).toHaveBeenCalled();
      expect(screen.getByText('Wallet Imported!')).toBeTruthy();
    });
  });

  it('completes the flow with existing locked vault', async () => {
    renderWithProvider(true, true); // hasVault = true, isLocked = true

    fireEvent.click(screen.getByText('Continue'));

    const inputs = screen.getAllByRole('textbox');
    for (let i = 0; i < 12; i++) {
      fireEvent.change(inputs[i]!, { target: { value: 'word' } });
    }

    fireEvent.click(screen.getByText('Verify Phrase'));

    await waitFor(() => {
      expect(screen.getByText('Unlock Vault')).toBeTruthy();
    });

    const passInputs = screen.getAllByPlaceholderText(/password/i);
    expect(passInputs).toHaveLength(1); // Only 1 input for unlocking

    fireEvent.change(passInputs[0]!, { target: { value: 'Test1234!' } });

    const unlockBtn = screen.getByText('Unlock & Import');
    fireEvent.click(unlockBtn);

    await waitFor(() => {
      expect(mockUnlock).toHaveBeenCalledWith('Test1234!');
      expect(mockCreateWallet).toHaveBeenCalled();
    });

    expect(screen.getByText('Wallet Imported!')).toBeTruthy();
  });
});
