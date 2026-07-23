import React, { useState } from 'react';
import { useExtensionContext } from '../../contexts/ExtensionProvider.js';
import { Button, Card, Badge } from '../../design-system/index.js';
import { SigningCoordinator } from '../../services/SigningCoordinator.js';
import { formatEther } from 'ethers';
import './WCModals.css'; // Reusing WC modal styling
import { useWallet } from '../../hooks/useWallet.js';

export const ExtensionRequestModal: React.FC = () => {
  const { currentRequest, approveRequest, rejectRequest } = useExtensionContext();
  const { isLocked, unlock } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  if (!currentRequest) return null;

  // If wallet is locked and we have a pending request, show an unlock form
  if (isLocked) {
    const handleUnlock = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!unlockPassword) return;
      setIsUnlocking(true);
      setUnlockError('');
      try {
        await unlock(unlockPassword);
      } catch (err: any) {
        setUnlockError(err.message || 'Incorrect password');
      } finally {
        setIsUnlocking(false);
      }
    };

    return (
      <div className="wc-modal-overlay">
        <Card className="wc-modal">
          <div className="wc-modal-header small">
            <h2 className="dapp-name">Unlock to Continue</h2>
          </div>
          <div className="wc-request-body">
            <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
              A dApp is requesting access. Enter your password to proceed.
            </p>
            <form onSubmit={handleUnlock}>
              <input
                id="unlock-password-input"
                type="password"
                placeholder="Enter password"
                value={unlockPassword}
                onChange={(e) => setUnlockPassword(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text-primary)',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
              {unlockError && (
                <p
                  style={{ color: 'var(--color-error)', marginTop: '0.5rem', fontSize: '0.875rem' }}
                >
                  {unlockError}
                </p>
              )}
            </form>
          </div>
          <div className="wc-actions">
            <Button
              variant="outline"
              onClick={() => rejectRequest('User cancelled')}
              disabled={isUnlocking}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => handleUnlock()}
              disabled={isUnlocking || !unlockPassword}
            >
              {isUnlocking ? 'Unlocking...' : 'Unlock'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const { origin, method, params, chainId } = currentRequest;

  let dappName = origin;
  try {
    dappName = new URL(origin).hostname;
  } catch (e) {
    // Keep origin as-is if it's not a URL (e.g., WC topic)
  }

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      if (method === 'eth_requestAccounts' || method === 'wallet_requestPermissions') {
        const accounts = await SigningCoordinator.getInstance().handleExtensionRequest(
          method,
          params,
          chainId?.toString()
        );
        await approveRequest(accounts);
      } else {
        const result = await SigningCoordinator.getInstance().handleExtensionRequest(
          method,
          params,
          chainId?.toString()
        );
        await approveRequest(result);
      }
    } catch (err: any) {
      console.error('[ExtensionRequestModal] Failed to process request', err);
      await rejectRequest(err.message || 'Action failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    await rejectRequest('User rejected request');
  };

  const decodeData = (data?: string) => {
    if (!data || data === '0x') return 'None (Native Transfer)';
    const sig = data.slice(0, 10).toLowerCase();
    switch (sig) {
      case '0xa9059cbb':
        return 'Transfer (ERC20)';
      case '0x095ea7b3':
        return 'Approve (ERC20)';
      case '0x23b872dd':
        return 'TransferFrom (ERC20)';
      case '0x2e1a7d4d':
        return 'Withdraw (WETH)';
      case '0xd0e30db0':
        return 'Deposit (WETH)';
      default:
        return 'Custom Contract Call';
    }
  };

  const renderDetails = () => {
    if (method === 'eth_requestAccounts' || method === 'wallet_requestPermissions') {
      return (
        <div className="request-details box">
          <h4>Connection Request</h4>
          <div className="detail-row">
            <span>Risk:</span> <Badge variant="warning">Medium</Badge>
          </div>
          <p style={{ marginTop: 'var(--space-2)' }}>
            This site is requesting access to view your account balance and address.
          </p>
        </div>
      );
    }

    if (method === 'personal_sign') {
      const msgHex = params[0];
      let msgStr = msgHex;
      try {
        if (msgHex.startsWith('0x')) {
          msgStr = decodeURIComponent(msgHex.slice(2).replace(/(..)/g, '%'));
        }
      } catch {
        /* Ignored */
      }

      return (
        <div className="request-details box">
          <h4>Signature Request</h4>
          <div className="detail-row">
            <span>Risk:</span> <Badge variant="warning">Low</Badge>
          </div>
          <div className="detail-row" style={{ marginTop: 'var(--space-2)' }}>
            <span>Message:</span>
          </div>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              margin: 0,
              padding: 'var(--space-2)',
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            {msgStr}
          </pre>
        </div>
      );
    }

    if (method === 'eth_signTypedData_v4') {
      const typedData = typeof params[1] === 'string' ? JSON.parse(params[1]) : params[1];
      return (
        <div className="request-details box">
          <h4>Typed Data Signature</h4>
          <div className="detail-row">
            <span>Risk:</span> <Badge variant="warning">Low-Medium</Badge>
          </div>
          <div className="detail-row" style={{ marginTop: 'var(--space-2)' }}>
            <span>Domain:</span>
            <span>{typedData.domain?.name || 'Unknown'}</span>
          </div>
          <pre
            style={{
              maxHeight: '150px',
              overflowY: 'auto',
              margin: 0,
              padding: 'var(--space-2)',
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            {JSON.stringify(typedData.message, null, 2)}
          </pre>
        </div>
      );
    }

    if (method === 'eth_sendTransaction') {
      const tx = params[0];
      const valueInEth = tx.value ? formatEther(tx.value) : '0';
      const isContractCall = tx.data && tx.data !== '0x';
      const interactionType = decodeData(tx.data);

      return (
        <div className="request-details box">
          <h4>Transaction Request</h4>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              margin: 'var(--space-3) 0'
            }}
          >
            <div className="detail-row">
              <span className="label">Destination:</span>{' '}
              <span className="truncate" style={{ flex: 1, textAlign: 'right' }}>
                {tx.to || 'Contract Creation'}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Value:</span> <span>{valueInEth} Native Currency</span>
            </div>
            <div className="detail-row">
              <span className="label">Chain:</span> <span>{chainId || 'Current'}</span>
            </div>
          </div>
          <div
            style={{
              borderTop: '1px solid var(--color-border-primary)',
              paddingTop: 'var(--space-3)',
              marginTop: 'var(--space-3)'
            }}
          >
            <div className="detail-row">
              <span className="label">Interaction:</span> <span>{interactionType}</span>
            </div>
          </div>
          <div
            style={{
              borderTop: '1px solid var(--color-border-primary)',
              paddingTop: 'var(--space-3)',
              marginTop: 'var(--space-3)'
            }}
          >
            <div className="detail-row">
              <span className="label">Risk Level:</span>{' '}
              {isContractCall ? (
                <Badge variant="error">High</Badge>
              ) : (
                <Badge variant="warning">Medium</Badge>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="request-details box warning">
        <h4>Unknown Method: {method}</h4>
        <p>This method is not fully supported or parsed. Proceed with extreme caution.</p>
      </div>
    );
  };

  return (
    <div className="wc-modal-overlay">
      <Card className="wc-modal">
        <div className="wc-modal-header small">
          <h2 className="dapp-name">
            {method === 'eth_requestAccounts' ? 'Connection Request' : 'Approval Request'}
          </h2>
          <Badge variant="brand">{dappName}</Badge>
        </div>

        <div className="wc-request-body">
          <div className="request-method">
            <span className="label">Origin:</span>
            <span className="value">{origin}</span>
          </div>
          {renderDetails()}
        </div>

        <div className="wc-actions">
          <Button variant="outline" onClick={handleReject} disabled={isProcessing}>
            Reject
          </Button>
          <Button variant="primary" onClick={handleApprove} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Approve'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
