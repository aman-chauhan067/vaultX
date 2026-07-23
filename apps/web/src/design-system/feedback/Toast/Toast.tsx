import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextType {
  showToast: (message: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...message, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000); // 5s timeout
  }, []);

  // Bridge window-level 'toast' custom events into the React context
  useEffect(() => {
    const handler = (e: Event) => {
      const { type, message } = (e as CustomEvent).detail || {};
      if (message) {
        showToast({ type: type || 'info', title: message });
      }
    };
    window.addEventListener('toast', handler);
    return () => window.removeEventListener('toast', handler);
  }, [showToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className={styles.successIcon} />;
      case 'error':
        return <XCircle size={20} className={styles.errorIcon} />;
      case 'warning':
        return <AlertTriangle size={20} className={styles.warningIcon} />;
      case 'info':
        return <Info size={20} className={styles.infoIcon} />;
    }
  };

  const toastRoot =
    typeof document !== 'undefined' ? document.getElementById('toast-root') || document.body : null;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toastRoot &&
        createPortal(
          <div className={styles.toastContainer}>
            <AnimatePresence>
              {toasts.map((toast) => (
                <motion.div
                  key={toast.id}
                  layout
                  initial={{
                    opacity: 0,
                    clipPath: 'circle(15px at 26px 22px)',
                    filter: 'blur(10px)',
                    scale: 0.95
                  }}
                  animate={{
                    opacity: 1,
                    clipPath: 'circle(150% at 26px 22px)',
                    filter: 'blur(0px)',
                    scale: 1
                  }}
                  exit={{
                    opacity: 0,
                    clipPath: 'circle(15px at 26px 22px)',
                    filter: 'blur(10px)',
                    scale: 0.95
                  }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className={clsx(styles.toast, styles[toast.type])}
                  role="alert"
                >
                  <div className={styles.iconWrapper}>{getIcon(toast.type)}</div>
                  <div className={styles.content}>
                    <h4 className={styles.title}>{toast.title}</h4>
                    {toast.description && <p className={styles.description}>{toast.description}</p>}
                  </div>
                  <button className={styles.closeButton} onClick={() => removeToast(toast.id)}>
                    <X size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>,
          toastRoot
        )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
