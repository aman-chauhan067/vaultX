import React, { useState } from 'react';

export const CryptoIcon: React.FC<{ symbol: string; size?: number }> = ({ symbol, size = 32 }) => {
  const [imgError, setImgError] = useState(false);

  // Normalize symbol for the CDN.
  let normalizedSymbol = symbol.toLowerCase();
  if (normalizedSymbol === 'sep') normalizedSymbol = 'eth'; // Sepolia uses ETH icon

  if (imgError) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'var(--color-bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.4,
          fontWeight: 'bold',
          color: 'var(--color-text-primary)'
        }}
      >
        {symbol.substring(0, 1).toUpperCase()}
      </div>
    );
  }

  const cdnUrl = `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${normalizedSymbol}.svg`;

  return (
    <img
      src={cdnUrl}
      alt={`${symbol} icon`}
      width={size}
      height={size}
      onError={() => setImgError(true)}
      style={{
        borderRadius: '50%',
        objectFit: 'contain'
      }}
    />
  );
};
