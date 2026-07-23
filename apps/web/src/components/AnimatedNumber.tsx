import React, { useEffect, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  minDecimals?: number;
  maxDecimals?: number;
  prefix?: string;
  suffix?: string;
}

export function AnimatedNumber({
  value,
  minDecimals = 2,
  maxDecimals = 6,
  prefix = '',
  suffix = ''
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    // Format the final target value accurately
    let formatted;
    if (maxDecimals > 2 && value < 1 && value > 0) {
      formatted = value.toLocaleString(undefined, {
        minimumFractionDigits: minDecimals,
        maximumFractionDigits: maxDecimals
      });
    } else {
      formatted = value.toLocaleString(undefined, {
        minimumFractionDigits: minDecimals,
        maximumFractionDigits: maxDecimals
      });
    }
    const finalStr = prefix + formatted + suffix;

    // We only animate if we actually have a number to show.
    // If the value is somehow NaN, just show it immediately.
    if (isNaN(value)) {
      setDisplay(finalStr);
      return;
    }

    const duration = 800; // 800ms total animation duration (fixed time)
    const interval = 40; // 40ms per frame (smooth and consistent speed)
    const totalFrames = duration / interval;
    let frame = 0;

    const tick = () => {
      frame++;
      const progress = frame / totalFrames;

      if (frame >= totalFrames) {
        setDisplay(finalStr);
        return;
      }

      // Calculate how many characters from the left should be locked in based on progress.
      // This creates a smooth "decoding" reveal effect from left to right.
      const charsToLock = Math.floor(finalStr.length * progress);

      let currentStr = '';
      for (let i = 0; i < finalStr.length; i++) {
        if (i < charsToLock) {
          // Locked in final character
          currentStr += finalStr[i];
        } else {
          // Still scrambling - only replace digits, keep commas and dots intact so the width doesn't glitch wildly
          const isDigit = /[0-9]/.test(finalStr[i] || '');
          if (isDigit) {
            currentStr += Math.floor(Math.random() * 10);
          } else {
            currentStr += finalStr[i];
          }
        }
      }

      setDisplay(currentStr);
    };

    // Run the first frame immediately
    tick();

    const timer = setInterval(tick, interval);
    return () => clearInterval(timer);
  }, [value, minDecimals, maxDecimals, prefix, suffix]);

  // Fallback before the first render effect
  return <span>{display || prefix + '0' + suffix}</span>;
}
