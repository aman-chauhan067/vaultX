import React, { useState } from 'react';
import { useWalletConnect } from '../../contexts/WalletConnectProvider.js';
import { Button, Card, Badge } from '../../design-system/index.js';
import { ShieldAlert, Link } from 'lucide-react';
import './WCModals.css';

export const WCSessionProposalModal: React.FC = () => {
  const { currentProposal, approveProposal, rejectProposal } = useWalletConnect();
  const [isApproving, setIsApproving] = useState(false);

  if (!currentProposal) return null;

  const { proposer, requiredNamespaces } = currentProposal;

  // VaultX only handles eip155 natively right now
  const eip155Namespace = requiredNamespaces['eip155'];
  const requestedChains = eip155Namespace?.chains?.map((c) =>
    c ? parseInt(c.split(':')[1] as string, 10) : 1
  ) || [1];

  const hasIncompleteMetadata = !proposer.url || !proposer.icons || proposer.icons.length === 0;

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await approveProposal(requestedChains);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    await rejectProposal('User rejected connection');
  };

  return (
    <div className="wc-modal-overlay">
      <Card className="wc-modal">
        <div className="wc-modal-header">
          <div className="dapp-icon-wrapper">
            {proposer.icons && proposer.icons[0] ? (
              <img src={proposer.icons[0]} alt={proposer.name} className="dapp-icon" />
            ) : (
              <Link size={32} />
            )}
          </div>
          <h2 className="dapp-name">{proposer.name}</h2>
          <a href={proposer.url} target="_blank" rel="noreferrer" className="dapp-url">
            {proposer.url || 'Unknown Origin'}
          </a>
        </div>

        {hasIncompleteMetadata && (
          <div className="wc-warning-banner">
            <ShieldAlert size={20} className="warning-icon" />
            <p>
              <strong>Warning:</strong> This DApp has incomplete metadata. It may be unsafe.
            </p>
          </div>
        )}

        <div className="wc-permissions">
          <h3>Requested Permissions</h3>
          <ul>
            <li>View your wallet balance and activity</li>
            <li>Request approval for transactions</li>
          </ul>

          <div className="wc-requested-chains">
            <h4>Networks</h4>
            <div className="badges">
              {requestedChains.map((c) => (
                <Badge key={c} variant="brand">
                  Chain ID: {c}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="wc-actions">
          <Button variant="outline" onClick={handleReject} disabled={isApproving}>
            Reject
          </Button>
          <Button variant="primary" onClick={handleApprove} disabled={isApproving}>
            {isApproving ? 'Connecting...' : 'Connect'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
