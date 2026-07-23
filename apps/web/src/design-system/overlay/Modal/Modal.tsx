import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { modalOverlayVariants, modalContentVariants } from '../../../theme/animations.js';
import styles from './Modal.module.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  hideCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = '500px',
  hideCloseButton = false
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus trapping (basic)
  useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    const focusableElements = contentRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length) {
      focusableElements[0]?.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (!firstElement || !lastElement) return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const modalRoot =
    typeof document !== 'undefined' ? document.getElementById('modal-root') || document.body : null;
  if (!modalRoot) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className={styles.modalPortal} role="dialog" aria-modal="true">
          <motion.div
            className={styles.backdrop}
            variants={modalOverlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
          />
          <div className={styles.contentWrapper}>
            <motion.div
              ref={contentRef}
              className={styles.modalContent}
              style={{ maxWidth }}
              variants={modalContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {(title || !hideCloseButton) && (
                <div className={styles.header}>
                  {title && <h2 className={styles.title}>{title}</h2>}
                  {!title && <div />}
                  {!hideCloseButton && (
                    <button
                      className={styles.closeButton}
                      onClick={onClose}
                      aria-label="Close modal"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              )}

              <div className={styles.body}>{children}</div>

              {footer && <div className={styles.footer}>{footer}</div>}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    modalRoot
  );
};
