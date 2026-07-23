import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { Modal } from '../design-system/overlay/Modal/Modal.js';
import { Button } from '../design-system/base/Button/Button.js';
import { Hammer } from 'lucide-react';

interface ComingSoonContextType {
  showComingSoon: (featureName: string) => void;
}

const ComingSoonContext = createContext<ComingSoonContextType | undefined>(undefined);

export const useComingSoon = () => {
  const context = useContext(ComingSoonContext);
  if (!context) {
    throw new Error('useComingSoon must be used within a ComingSoonProvider');
  }
  return context;
};

export const ComingSoonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feature, setFeature] = useState('');

  const showComingSoon = (featureName: string) => {
    setFeature(featureName);
    setIsOpen(true);
  };

  return (
    <ComingSoonContext.Provider value={{ showComingSoon }}>
      {children}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Hammer size={20} /> Feature in Development
          </div>
        }
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="primary" onClick={() => setIsOpen(false)}>
              Understood
            </Button>
          </div>
        }
      >
        <div style={{ padding: '1rem 0' }}>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            The <strong>{feature}</strong> feature is currently being built in our orbital
            shipyards. It will be available in an upcoming release.
          </p>
        </div>
      </Modal>
    </ComingSoonContext.Provider>
  );
};
