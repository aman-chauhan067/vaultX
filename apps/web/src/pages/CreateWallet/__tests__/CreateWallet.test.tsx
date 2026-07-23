import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateWallet from '../index.js';
import { WalletContext } from '../../../contexts/WalletContext.js';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('CreateWallet Flow', () => {
  const mockWalletContext = {
    isLocked: false,
    hasVault: false,
    wallets: [],
    activeWalletId: null,
    activeAccountId: null,
    error: null,
    unlock: vi.fn(),
    createVault: vi.fn(),
    lock: vi.fn(),
    createWallet: vi.fn(),
    deriveAccount: vi.fn(),
    importWallet: vi.fn(),
    validateMnemonic: vi.fn(),
    generateMnemonic: vi
      .fn()
      .mockReturnValue(
        'apple banana cherry date elderberry fig grape honeydew kiwi lemon mango nectarine'
      ),
    resetVault: vi.fn(),
    pingSession: vi.fn(),
    getSessionState: vi.fn().mockReturnValue({}),
    setActiveWallet: vi.fn(),
    setActiveAccount: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (contextOverrides = {}) => {
    return render(
      <MemoryRouter>
        <WalletContext.Provider value={{ ...mockWalletContext, ...contextOverrides }}>
          <CreateWallet />
        </WalletContext.Provider>
      </MemoryRouter>
    );
  };

  it('renders intro step and moves to phrase step on start', () => {
    renderComponent();
    expect(screen.getByText('Secure your wallet')).toBeDefined();

    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    expect(screen.getByText('Your Recovery Phrase')).toBeDefined();
    expect(mockWalletContext.generateMnemonic).toHaveBeenCalled();
  });

  it('handles wrong recovery confirmation', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Start')); // Move to phrase

    // Reveal and proceed
    fireEvent.click(screen.getByText('Click to reveal'));
    fireEvent.click(screen.getByText('I saved it')); // Move to confirm

    expect(screen.getByText('Confirm Phrase')).toBeDefined();

    // Attempt with wrong inputs
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0]!, { target: { value: 'wrongword' } });
    fireEvent.click(screen.getByText('Confirm'));

    expect(
      screen.getByText('One or more words are incorrect. Please check your backup.')
    ).toBeDefined();
  });

  it('handles password mismatch', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Start'));
    fireEvent.click(screen.getByText('Click to reveal'));
    fireEvent.click(screen.getByText('I saved it'));

    // We mock the indices picking to know what to fill
    const expectedWords =
      'apple banana cherry date elderberry fig grape honeydew kiwi lemon mango nectarine'.split(
        ' '
      );
    const inputs = screen.getAllByRole('textbox');
    // We can't know which indices the component picked because it's random, but we can read the label
    inputs.forEach((input) => {
      const label = input.getAttribute('placeholder') || '';
      const num = parseInt(label.replace('Enter word ', '')) - 1;
      fireEvent.change(input, { target: { value: expectedWords[num] } });
    });

    fireEvent.click(screen.getByText('Confirm')); // Move to password

    expect(screen.getByText('Create Password')).toBeDefined();

    const pwInputs = screen.getAllByLabelText(/Password/i);
    fireEvent.change(pwInputs[0]!, { target: { value: 'StrongPass123!' } });
    fireEvent.change(pwInputs[1]!, { target: { value: 'MismatchedPass!' } });
    fireEvent.click(screen.getByText('Encrypt & Create'));

    expect(screen.getByText('Passwords do not match')).toBeDefined();
  });

  it('successful vault and wallet creation', async () => {
    renderComponent();
    fireEvent.click(screen.getByText('Start'));
    fireEvent.click(screen.getByText('Click to reveal'));
    fireEvent.click(screen.getByText('I saved it'));

    const expectedWords =
      'apple banana cherry date elderberry fig grape honeydew kiwi lemon mango nectarine'.split(
        ' '
      );
    screen.getAllByRole('textbox').forEach((input) => {
      const num =
        parseInt((input.getAttribute('placeholder') || '').replace('Enter word ', '')) - 1;
      fireEvent.change(input, { target: { value: expectedWords[num] } });
    });

    fireEvent.click(screen.getByText('Confirm'));

    const pwInputs = screen.getAllByLabelText(/Password/i);
    fireEvent.change(pwInputs[0]!, { target: { value: 'StrongPass123!' } });
    fireEvent.change(pwInputs[1]!, { target: { value: 'StrongPass123!' } });
    fireEvent.click(screen.getByText('Encrypt & Create'));

    await waitFor(() => {
      expect(mockWalletContext.createVault).toHaveBeenCalledWith('StrongPass123!');
      expect(mockWalletContext.createWallet).toHaveBeenCalled();
    });

    expect(screen.getByText('Wallet Created!')).toBeDefined();
  });
});
