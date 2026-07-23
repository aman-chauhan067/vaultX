import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

function AnimatedStat({
  target,
  prefix = '',
  suffix = '',
  delay = 0
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  delay?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (isInView) {
      let startTime: number | null = null;
      const duration = 1200; // 1.2s counting animation

      const timeout = setTimeout(() => {
        const step = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / duration, 1);
          // easeOutExpo
          const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          setCount(Math.round(easeProgress * target));

          if (progress < 1) {
            window.requestAnimationFrame(step);
          }
        };
        window.requestAnimationFrame(step);
      }, delay * 1000); // apply delay in ms

      return () => clearTimeout(timeout);
    }
  }, [isInView, target, delay]);

  return (
    <div
      ref={ref}
      style={{
        fontFamily: 'CustomHelvetica, sans-serif',
        fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
        fontWeight: 700,
        color: '#FAFAFA',
        letterSpacing: '-0.03em',
        marginBottom: '0.5rem'
      }}
    >
      {prefix}
      {count}
      {suffix}
    </div>
  );
}

export function AnimatedStatGrid() {
  const stats = [
    { target: 1, prefix: '<', suffix: 's', cap: 'Cold start to ready' },
    { target: 12, prefix: '', suffix: 'MB', cap: 'Total bundle size' },
    { target: 8, prefix: '', suffix: '+', cap: 'Supported networks' },
    { target: 0, prefix: '', suffix: '', cap: 'Data sent to servers' }
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '1000px',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        overflow: 'hidden'
      }}
    >
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: i * 0.4 }} // sequential reveal
          style={{
            flex: '1 1 200px',
            padding: '3rem 2rem',
            textAlign: 'center',
            borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            transition: 'background 0.3s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <AnimatedStat
            target={stat.target}
            prefix={stat.prefix}
            suffix={stat.suffix}
            delay={i * 0.4}
          />
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#3F3F46'
            }}
          >
            {stat.cap}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
