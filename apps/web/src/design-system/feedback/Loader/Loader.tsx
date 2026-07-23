import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import styles from './Loader.module.css';

export interface LoaderProps {
  fullScreen?: boolean;
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({ fullScreen = false, text }) => {
  const containerClass = fullScreen ? styles.fullScreen : styles.container;

  return (
    <div className={containerClass}>
      <div className={styles.logoWrapper}>
        <motion.div
          className={styles.glow}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <Shield size={48} className={styles.icon} />
        </motion.div>

        {/* Soft particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={styles.particle}
            initial={{ y: 0, opacity: 0 }}
            animate={{
              y: [-20, -60],
              opacity: [0, 1, 0],
              x: Math.sin(i) * 20
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
              ease: 'easeOut'
            }}
          />
        ))}
      </div>

      {text && (
        <motion.p
          className={styles.text}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};
