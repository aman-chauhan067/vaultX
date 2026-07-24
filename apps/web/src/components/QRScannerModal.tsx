import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './QRScannerModal.css';

export interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (address: string) => void;
}

export function QRScannerModal({ isOpen, onClose, onScan }: QRScannerModalProps) {
  const [error, setError] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
      return;
    }

    setError('');

    const timer = setTimeout(() => {
      const scannerId = 'qr-reader';
      const html5QrCode = new Html5Qrcode(scannerId);
      scannerRef.current = html5QrCode;

      html5QrCode
        .start(
          { facingMode: 'environment' },
          { fps: 10 }, // Removed qrbox for edge-to-edge Apple-like scanning
          (decodedText) => {
            let address = decodedText;
            if (address.toLowerCase().startsWith('ethereum:')) {
              const parts = address.split('ethereum:');
              if (parts.length > 1 && parts[1]) {
                address = parts[1].split('@')[0] || '';
              }
            }
            if (address) {
              onScan(address);
            }

            if (html5QrCode.isScanning) {
              html5QrCode
                .stop()
                .then(() => {
                  setTimeout(() => onClose(), 100);
                })
                .catch(() => {
                  setTimeout(() => onClose(), 100);
                });
            } else {
              onClose();
            }
          },
          (errorMessage) => {}
        )
        .catch((err) => {
          console.error(err);
          setError('Failed to start camera. Please check permissions.');
        });
    }, 150);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isOpen, onClose, onScan]);

  const handleClose = () => {
    if (scannerRef.current?.isScanning) {
      scannerRef.current
        .stop()
        .then(() => onClose())
        .catch(() => onClose());
    } else {
      onClose();
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="qr-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="qr-modal-card"
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="qr-modal-video-container">
              {error ? (
                <div style={{ color: 'var(--color-danger)', textAlign: 'center', padding: '40px' }}>
                  {error}
                </div>
              ) : (
                <div id="qr-reader"></div>
              )}

              <button onClick={handleClose} className="qr-modal-floating-close">
                <X size={24} color="white" />
              </button>

              <div className="qr-modal-overlay-text">
                <Scan size={20} color="white" /> Scan QR Code
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return document.body ? createPortal(modalContent, document.body) : modalContent;
}
