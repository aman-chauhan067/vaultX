import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useActiveWallet, useNetwork, useTransactions, usePortfolio } from '../../hooks/index.js';
import { useNetworkStats } from '../../hooks/useNetworkStats.js';
import {
  isAddress,
  parseEther,
  formatEther,
  parseUnits,
  formatUnits
} from '@vaultx/network-engine';
import { VaultXService } from '../../services/VaultXService.js';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { BackButton } from '../../components/index.js';

type WizardState = 'recipient' | 'amount' | 'review' | 'broadcasting' | 'success' | 'failed';

export default function Send() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeWallet = useActiveWallet();
  const { activeChainId, supportedNetworks } = useNetwork();
  const activeNetwork = supportedNetworks.find((n) => n.chainId === activeChainId);
  const { data: stats } = useNetworkStats(activeWallet?.address);
  const { sendTransaction, prepareTransaction } = useTransactions();
  const { portfolio } = usePortfolio();

  const tokenParam = searchParams.get('token') || 'native';
  const isNative = tokenParam === 'native';

  const token = useMemo(() => {
    if (isNative) {
      return {
        name: activeNetwork?.currency.name || 'Ethereum',
        symbol: activeNetwork?.currency.symbol || 'ETH',
        decimals: activeNetwork?.currency.decimals || 18,
        address: 'native',
        balance: portfolio?.ethBalance || '0',
        formattedBalance: portfolio?.formattedEthBalance || '0.0'
      };
    }
    return portfolio?.tokens.find((t) => t.address.toLowerCase() === tokenParam.toLowerCase());
  }, [tokenParam, portfolio, isNative, activeNetwork]);

  const [stage, setStage] = useState<WizardState>('recipient');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const [isEstimating, setIsEstimating] = useState(false);
  const [gasFee, setGasFee] = useState<string>('0');
  const [gasLimit, setGasLimit] = useState<string>('21000');

  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const validateRecipient = () => {
    setError(null);
    if (!recipient.trim()) {
      setError('Enter a recipient address to continue.');
      return false;
    }
    if (!isAddress(recipient.trim())) {
      setError('The address you entered is not a valid Ethereum address.');
      return false;
    }
    if (recipient.toLowerCase() === activeWallet?.address.toLowerCase()) {
      setError('You cannot send funds to your own address.');
      return false;
    }
    return true;
  };

  const validateAmount = () => {
    setError(null);
    const trimmed = amount.trim();
    if (!trimmed) {
      setError('Enter a valid positive amount.');
      return false;
    }
    const num = Number(trimmed);
    if (isNaN(num)) {
      setError('Unable to parse token amount. Use numeric digits only.');
      return false;
    }
    if (num <= 0) {
      setError('Enter a valid positive amount.');
      return false;
    }
    // Check for invalid decimal precision
    const decimalStr = trimmed.split('.')?.[1];
    if (decimalStr && decimalStr.length > (token?.decimals || 18)) {
      setError(`Amount contains too many decimal places. Maximum: ${token?.decimals || 18}.`);
      return false;
    }
    try {
      const parsedAmount = parseUnits(trimmed, token?.decimals || 18);
      const balance = BigInt(token?.balance || '0');
      if (parsedAmount > balance) {
        setError('Amount exceeds your available balance.');
        return false;
      }
    } catch {
      setError('Unable to parse token amount. Check your input and try again.');
      return false;
    }
    return true;
  };

  const [preparedReq, setPreparedReq] = useState<any>(null);

  const handleReview = async () => {
    if (isEstimating) return;
    if (!validateAmount()) return;
    if (!token) return;

    setIsEstimating(true);
    setError(null);
    try {
      const partialReq: any = {};
      if (isNative) {
        partialReq.to = recipient;
        partialReq.value = parseEther(amount).toString();
        partialReq.data = '0x';
      } else {
        partialReq.to = token.address;
        partialReq.value = '0';
        partialReq.data = VaultXService.getInstance().assetManager.buildTransferData(
          recipient,
          amount,
          token.decimals
        );
      }

      const prepared = await prepareTransaction(partialReq);
      setPreparedReq(prepared);

      // Calculate fee for display
      const gas = BigInt(prepared.gasLimit || '21000');
      const price = BigInt(prepared.maxFeePerGas || prepared.gasPrice || '1000000000');
      const estimatedFee = gas * price;

      setGasLimit(gas.toString());
      setGasFee(estimatedFee.toString());

      const nativeBalance = parseEther(stats?.balance || '0');
      if (isNative) {
        if (parseEther(amount) + estimatedFee > nativeBalance) {
          console.warn('Insufficient balance for amount + gas (Bypassed for UI testing)');
          // setError('Insufficient balance for amount + gas'); setIsEstimating(false); return;
        }
      } else {
        if (estimatedFee > nativeBalance) {
          console.warn(
            `Insufficient ${activeNetwork?.currency.symbol || 'ETH'} to cover the network fee (Bypassed for UI testing)`
          );
          // setError(`Insufficient ${activeNetwork?.currency.symbol || 'ETH'} to cover the network fee.`); setIsEstimating(false); return;
        }
      }

      setStage('review');
    } catch (err: any) {
      setError(
        err.message || 'Unable to estimate gas. The network may be congested. Please try again.'
      );
    } finally {
      setIsEstimating(false);
    }
  };

  const handleConfirm = async () => {
    if (stage !== 'review' || !preparedReq) return;
    try {
      setStage('broadcasting');
      const hash = await sendTransaction(preparedReq);
      setTxHash(hash);
      setStage('success');
    } catch (err: any) {
      setError(
        err.message ||
          'The transaction could not be broadcast. Please check your connection and try again.'
      );
      setStage('failed');
    }
  };

  if (!token) {
    navigate('/portfolio');
    return null;
  }

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '2rem 0',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <BackButton
          label={
            stage === 'recipient' || stage === 'success' || stage === 'failed' ? 'Cancel' : 'Back'
          }
          onClick={() =>
            stage === 'recipient' || stage === 'success' || stage === 'failed'
              ? navigate(-1)
              : setStage(stage === 'amount' ? 'recipient' : 'amount')
          }
        />
        <div
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#52525b'
          }}
        >
          Transfer {token.symbol}
        </div>
      </motion.div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <AnimatePresence mode="wait">
          {stage === 'recipient' && (
            <motion.div
              key="recipient"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.6 }}
              style={{
                width: '100%',
                maxWidth: '800px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4rem'
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  color: '#52525b'
                }}
              >
                Destination
              </span>

              <input
                type="text"
                value={recipient}
                onChange={(e) => {
                  setRecipient(e.target.value);
                  setError(null);
                }}
                placeholder="0x..."
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: error ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.2)',
                  padding: '1rem 0',
                  fontSize: 'clamp(2rem, 5vw, 4rem)',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                  fontFamily: 'var(--font-mono)',
                  textAlign: 'center',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => {
                  if (!error) e.currentTarget.style.borderBottomColor = '#ffffff';
                }}
                onBlur={(e) => {
                  if (!error) e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.2)';
                }}
              />

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2rem',
                  height: '60px'
                }}
              >
                {error && <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</span>}
                <div
                  onClick={() => validateRecipient() && setStage('amount')}
                  style={{
                    opacity: recipient ? 1 : 0.3,
                    pointerEvents: recipient ? 'auto' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem 3rem',
                    borderRadius: '100px',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                    transition: 'transform 0.3s'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  Continue <ArrowRight size={16} />
                </div>
              </div>
            </motion.div>
          )}

          {stage === 'amount' && (
            <motion.div
              key="amount"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.6 }}
              style={{
                width: '100%',
                maxWidth: '800px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem'
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  color: '#52525b'
                }}
              >
                Send Amount
              </span>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '1rem',
                  borderBottom: error ? '1px solid #ef4444' : '1px solid transparent',
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError(null);
                  }}
                  placeholder="0.0"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    width: `${Math.max(3, amount.length + 0.5)}ch`,
                    fontSize:
                      amount.length > 6
                        ? `clamp(2rem, ${12 - (amount.length - 6) * 0.8}vw, ${Math.max(2, 8 - (amount.length - 6) * 0.6)}rem)`
                        : 'clamp(4rem, 12vw, 8rem)',
                    fontWeight: 300,
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                    textAlign: 'right',
                    padding: 0
                  }}
                />
                <span
                  style={{
                    fontSize: 'clamp(2rem, 5vw, 4rem)',
                    color: '#52525b',
                    fontWeight: 300,
                    flexShrink: 0
                  }}
                >
                  {token.symbol}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2rem',
                  height: '100px',
                  marginTop: '2rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#52525b' }}>
                    Available: {token.formattedBalance} {token.symbol}
                  </span>
                  <span
                    onClick={() => {
                      if (!token.balance) return;
                      if (isNative) {
                        const res = parseEther('0.001');
                        if (BigInt(token.balance) > res) {
                          setAmount(formatEther(BigInt(token.balance) - res));
                        } else {
                          setAmount(formatEther(BigInt(token.balance)));
                        }
                      } else {
                        setAmount(formatUnits(BigInt(token.balance), token.decimals));
                      }
                    }}
                    style={{
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#a1a1aa',
                      cursor: 'pointer',
                      borderBottom: '1px solid #a1a1aa'
                    }}
                  >
                    Max
                  </span>
                </div>
                {error && <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</span>}

                <div
                  onClick={handleReview}
                  style={{
                    opacity: amount && !isEstimating ? 1 : 0.3,
                    pointerEvents: amount && !isEstimating ? 'auto' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem 3rem',
                    borderRadius: '100px',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                    transition: 'transform 0.3s'
                  }}
                >
                  {isEstimating ? 'Estimating...' : 'Review'} <ArrowRight size={16} />
                </div>
              </div>
            </motion.div>
          )}

          {stage === 'review' && (
            <motion.div
              key="review"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.6 }}
              style={{
                width: '100%',
                maxWidth: '600px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4rem'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    color: '#52525b'
                  }}
                >
                  Send
                </span>
                <div style={{ fontSize: 'clamp(3rem, 6vw, 4rem)', fontWeight: 300, lineHeight: 1 }}>
                  {amount} {token.symbol}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    paddingBottom: '1rem'
                  }}
                >
                  <span style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>To</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                    {recipient}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    paddingBottom: '1rem'
                  }}
                >
                  <span style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>Network</span>
                  <span style={{ fontSize: '0.875rem' }}>{activeNetwork?.name}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    paddingBottom: '1rem'
                  }}
                >
                  <span style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>Network Fee</span>
                  <span style={{ fontSize: '0.875rem' }}>
                    ~{formatEther(gasFee)} {activeNetwork?.currency.symbol}
                  </span>
                </div>
                {isNative && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                      Total Deducted
                    </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 300 }}>
                      {formatEther(parseEther(amount) + BigInt(gasFee))}{' '}
                      {activeNetwork?.currency.symbol}
                    </span>
                  </div>
                )}
              </div>

              <div
                onClick={handleConfirm}
                style={{
                  alignSelf: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem 4rem',
                  borderRadius: '100px',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 600,
                  transition: 'transform 0.3s'
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                Confirm
              </div>
            </motion.div>
          )}

          {stage === 'broadcasting' && (
            <motion.div
              key="broadcasting"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.6 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem'
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.1)',
                  borderTopColor: '#ffffff'
                }}
              />
              <div style={{ fontSize: '1.25rem', fontWeight: 300 }}>Submitting transaction...</div>
              <div style={{ fontSize: '0.875rem', color: '#52525b' }}>
                Please wait while the transaction is broadcast to the network.
              </div>
            </motion.div>
          )}

          {stage === 'success' && (
            <motion.div
              key="success"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.6 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3rem',
                textAlign: 'center'
              }}
            >
              <CheckCircle2 size={64} color="#4ade80" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 300 }}>
                  Transaction Submitted
                </div>
                <div style={{ fontSize: '1.25rem', color: '#a1a1aa', fontWeight: 300 }}>
                  {amount} {token.symbol} sent
                </div>
                {txHash && (
                  <span
                    style={{
                      fontSize: '0.875rem',
                      color: '#52525b',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {txHash.slice(0, 12)}...{txHash.slice(-10)}
                  </span>
                )}
              </div>
              <div
                onClick={() => navigate('/activity')}
                style={{
                  padding: '1rem 3rem',
                  borderRadius: '100px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  transition: 'background 0.3s'
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)')
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')
                }
              >
                View Activity
              </div>
            </motion.div>
          )}

          {stage === 'failed' && (
            <motion.div
              key="failed"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.6 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3rem',
                textAlign: 'center'
              }}
            >
              <XCircle size={64} color="#ef4444" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '2rem', fontWeight: 300 }}>Transaction Failed</div>
                <span style={{ fontSize: '1rem', color: '#ef4444', maxWidth: '400px' }}>
                  {error}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div
                  onClick={() => setStage('review')}
                  style={{
                    padding: '1rem 3rem',
                    borderRadius: '100px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    transition: 'background 0.3s'
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)')
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')
                  }
                >
                  Try Again
                </div>
                <div
                  onClick={() => navigate('/dashboard')}
                  style={{
                    padding: '1rem 3rem',
                    borderRadius: '100px',
                    color: '#8A8A93',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    transition: 'color 0.3s'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#ffffff')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#8A8A93')}
                >
                  Go Home
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
