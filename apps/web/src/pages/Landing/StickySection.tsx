import React from 'react';

export const StickySection = ({
  children,
  height = '200vh'
}: {
  children: React.ReactNode;
  height?: string;
}) => {
  return (
    <section
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10vh 5vw',
        position: 'relative',
        scrollSnapAlign: 'center'
      }}
    >
      {children}
    </section>
  );
};
