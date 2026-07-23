import React from 'react';
import { BackButton } from '../../components/index.js';
import { useTransactions, useNetwork, usePortfolio, useActiveWallet } from '../../hooks/index.js';
import { VaultXService } from '../../services/VaultXService.js';
import { formatUnits, formatEther } from '@vaultx/network-engine';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function Activity() {
  const { history, pendingTransactions } = useTransactions();
  const { activeChainId, supportedNetworks } = useNetwork();
  const activeNetwork = supportedNetworks.find((n) => n.chainId === activeChainId);
  const { portfolio } = usePortfolio();
  const activeWallet = useActiveWallet();
  const navigate = useNavigate();

  const shortenAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (bal: string) => {
    const num = parseFloat(bal);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 18 });
  };

  const allEmpty = pendingTransactions.length === 0 && history.length === 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        padding: '0 5vw',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Top Nav - Level 4 Metadata */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '2rem 0',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <BackButton />
        <div
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#52525b'
          }}
        >
          Network Activity
        </div>
      </motion.div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '10vh' }}>
        {/* Level 1: Context Header (The Timeline) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div
            style={{
              fontSize: 'clamp(3rem, 8vw, 5rem)',
              fontWeight: 300,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              marginBottom: '6rem'
            }}
          >
            Ledger
          </div>
        </motion.div>

        {/* Level 2: The Timeline Data (No Cards) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ display: 'flex', flexDirection: 'column', paddingBottom: '10vh' }}
        >
          {allEmpty ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem',
                padding: '8vh 0',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '4rem', opacity: 0.2 }}>◎</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 300,
                    color: 'var(--color-text-primary)'
                  }}
                >
                  No activity yet
                </span>
                <span style={{ fontSize: '0.875rem', color: '#52525b', maxWidth: '320px' }}>
                  Once you send or receive your first transaction, it will appear here.
                </span>
              </div>
              <div
                onClick={() => navigate('/send')}
                style={{
                  padding: '0.875rem 2rem',
                  borderRadius: '100px',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 600,
                  transition: 'transform 0.3s'
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                Send your first transaction
              </div>
            </motion.div>
          ) : (
            <>
              {pendingTransactions.map((tx, i) => {
                const decoded = VaultXService.getInstance().assetManager.parseTransferData(
                  tx.request.data || '0x'
                );
                const isERC20 = decoded !== null;
                const tokenInfo = isERC20
                  ? portfolio?.tokens.find(
                      (t) => t.address.toLowerCase() === tx.request.to?.toLowerCase()
                    )
                  : null;
                const symbol = isERC20
                  ? tokenInfo?.symbol || 'ERC20'
                  : activeNetwork?.currency.symbol || 'ETH';
                const amount = isERC20
                  ? tokenInfo
                    ? formatUnits(decoded.amount, tokenInfo.decimals)
                    : decoded.amount
                  : tx.request.value
                    ? formatBalance(formatEther(tx.request.value))
                    : '0.0';

                return (
                  <motion.div
                    key={`pending-${tx.hash || i}`}
                    variants={itemVariants}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2rem 0',
                      borderBottom: '1px solid rgba(255,255,255,0.05)'
                    }}
                  >
                    <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: '2rem' }}>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          color: '#f59e0b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          width: '100px'
                        }}
                      >
                        Pending
                      </span>
                      <span style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 300 }}>
                        Sending {symbol}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '0.5rem'
                      }}
                    >
                      <span style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 300 }}>
                        {amount}
                      </span>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          color: '#52525b',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        To: {shortenAddress(isERC20 ? decoded.to : tx.request.to || '')}
                      </span>
                    </div>
                  </motion.div>
                );
              })}

              {history.map((tx, i) => {
                const decoded = VaultXService.getInstance().assetManager.parseTransferData(
                  tx.request.data || '0x'
                );
                const isERC20 = decoded !== null;
                const tokenInfo = isERC20
                  ? portfolio?.tokens.find(
                      (t) => t.address.toLowerCase() === tx.request.to?.toLowerCase()
                    )
                  : null;
                const symbol = isERC20
                  ? tokenInfo?.symbol || 'ERC20'
                  : activeNetwork?.currency.symbol || 'ETH';
                const amount = isERC20
                  ? tokenInfo
                    ? formatUnits(decoded.amount, tokenInfo.decimals)
                    : decoded.amount
                  : tx.request.value
                    ? formatBalance(formatEther(tx.request.value))
                    : '0.0';

                const isSuccess = tx.receipt?.status === 1;
                const isSend =
                  tx.request?.from?.toLowerCase() === activeWallet?.address?.toLowerCase();

                return (
                  <motion.div
                    key={`history-${tx.receipt?.transactionHash || i}`}
                    variants={itemVariants}
                    onClick={() => {
                      if (tx.receipt?.transactionHash && activeNetwork?.explorer) {
                        window.open(
                          `${activeNetwork.explorer}/tx/${tx.receipt.transactionHash}`,
                          '_blank'
                        );
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2rem 0',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      transition: 'background 0.3s'
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)')
                    }
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: '2rem' }}>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          color: isSuccess ? '#52525b' : '#ef4444',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          width: '100px'
                        }}
                      >
                        {isSuccess ? 'Confirmed' : 'Failed'}
                      </span>
                      <span
                        style={{
                          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                          fontWeight: 300,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem'
                        }}
                      >
                        {isSend ? 'Sent' : 'Received'} {symbol}
                        {isSend ? (
                          <ArrowUpRight size={24} color="#52525b" />
                        ) : (
                          <ArrowDownLeft size={24} color="#52525b" />
                        )}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '0.5rem'
                      }}
                    >
                      <span
                        style={{
                          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                          fontWeight: 300,
                          color: isSuccess ? '#ffffff' : '#52525b'
                        }}
                      >
                        {amount}
                      </span>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          color: '#52525b',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        {shortenAddress(tx.receipt?.transactionHash || '')}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
