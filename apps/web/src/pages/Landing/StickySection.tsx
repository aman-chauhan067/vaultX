import React from 'react';

export const StickySection = ({
  children,
  height = '200vh'
}: {
  children: React.ReactNode;
  height?: string;
}) => {
  return (
    <div style={{ height, position: 'relative', width: '100%' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 5vw',
          zIndex: 10,
          backgroundColor: 'transparent'
        }}
      >
        {children}
      </div>
    </div>
  );
};
