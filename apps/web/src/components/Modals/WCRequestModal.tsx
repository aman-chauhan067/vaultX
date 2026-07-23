import React, { useState } from 'react';
import { useWalletConnect } from '../../contexts/WalletConnectProvider.js';
import { Button, Card, Badge } from '../../design-system/index.js';
import { SigningCoordinator } from '../../services/SigningCoordinator.js';
import { formatEther } from 'ethers';
import './WCModals.css';

export const WCRequestModal: React.FC = () => {
  const { currentRequest, approveRequest, rejectRequest } = useWalletConnect();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!currentRequest) return null;

  const { peer, request, chainId } = currentRequest;
  const method = request.method;

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const coordinator = SigningCoordinator.getInstance();
      const result = await coordinator.handleWalletConnectRequest(method, request.params, chainId);
      await approveRequest(result);
    } catch (err: any) {
      console.error('[WCRequestModal] Failed to process request', err);
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
    // Basic signature checking (first 4 bytes / 8 chars after 0x)
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
    try {
      if (method === 'personal_sign') {
        const msgHex = request.params[0];
        let msgStr = msgHex;
        try {
          // Attempt to decode hex string to utf8
          if (msgHex.startsWith('0x')) {
            msgStr = decodeURIComponent(msgHex.slice(2).replace(/(..)/g, '%'));
          }
        } catch {
          // Ignore decoding errors
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
        const typedData =
          typeof request.params[1] === 'string' ? JSON.parse(request.params[1]) : request.params[1];
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
            <div className="detail-row" style={{ marginTop: 'var(--space-2)' }}>
              <span>Message:</span>
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
        const tx = request.params[0];
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
                <span className="label">Destination:</span>
                <span className="truncate" style={{ flex: 1, textAlign: 'right' }}>
                  {tx.to || 'Contract Creation'}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Value:</span>
                <span>{valueInEth} Native Currency</span>
              </div>
              <div className="detail-row">
                <span className="label">Chain:</span>
                <span>{chainId}</span>
              </div>
              <div className="detail-row">
                <span className="label">Gas Limit:</span>
                <span>{tx.gas ? parseInt(tx.gas, 16).toString() : 'Automatic'}</span>
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
                <span className="label">Interaction:</span>
                <span>{interactionType}</span>
              </div>
              {isContractCall && (
                <div style={{ marginTop: 'var(--space-2)' }}>
                  <span
                    className="label"
                    style={{ display: 'block', marginBottom: 'var(--space-1)' }}
                  >
                    Data:
                  </span>
                  <div
                    className="truncate"
                    style={{
                      fontSize: 'var(--text-caption)',
                      color: 'var(--color-text-secondary)',
                      background: 'var(--color-bg-secondary)',
                      padding: 'var(--space-2)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    {tx.data}
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                borderTop: '1px solid var(--color-border-primary)',
                paddingTop: 'var(--space-3)',
                marginTop: 'var(--space-3)'
              }}
            >
              <div className="detail-row">
                <span className="label">Risk Level:</span>
                {isContractCall ? (
                  <Badge variant="error">High</Badge>
                ) : (
                  <Badge variant="warning">Medium</Badge>
                )}
              </div>
              {isContractCall && (
                <p
                  style={{
                    fontSize: 'var(--text-caption)',
                    color: 'var(--color-error-text)',
                    marginTop: 'var(--space-2)'
                  }}
                >
                  Warning: Interacting with smart contracts can result in loss of funds. Ensure you
                  trust {peer.name}.
                </p>
              )}
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
    } catch {
      return (
        <div className="request-details box warning">Could not parse request details safely.</div>
      );
    }
  };

  return (
    <div className="wc-modal-overlay">
      <Card className="wc-modal">
        <div className="wc-modal-header small">
          <h2 className="dapp-name">Signature Request</h2>
          <Badge variant="brand">{peer.name}</Badge>
        </div>

        <div className="wc-request-body">
          <div className="request-method">
            <span className="label">DApp Origin:</span>
            <span className="value">{peer.url}</span>
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
