import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const manifestoData = [
  { num: '01', title: 'Privacy', desc: "Your financial activity is nobody's business." },
  { num: '02', title: 'Ownership', desc: "If you don't hold the keys, you don't own the asset." },
  {
    num: '03',
    title: 'Transparency',
    desc: "Open source isn't optional. It's the only way to earn trust."
  },
  {
    num: '04',
    title: 'Performance',
    desc: 'Speed is a feature. Every interaction should feel instant.'
  },
  { num: '05', title: 'Minimalism', desc: 'The best interface is the one you barely notice.' }
];

function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians)
  };
}

function describeAnnularSector(
  cx: number,
  cy: number,
  rIn: number,
  rOut: number,
  startAngle: number,
  endAngle: number
) {
  const startOut = polarToCartesian(cx, cy, rOut, startAngle);
  const endOut = polarToCartesian(cx, cy, rOut, endAngle);
  const startIn = polarToCartesian(cx, cy, rIn, startAngle);
  const endIn = polarToCartesian(cx, cy, rIn, endAngle);

  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M',
    startOut.x,
    startOut.y,
    'A',
    rOut,
    rOut,
    0,
    largeArc,
    1,
    endOut.x,
    endOut.y,
    'L',
    endIn.x,
    endIn.y,
    'A',
    rIn,
    rIn,
    0,
    largeArc,
    0,
    startIn.x,
    startIn.y,
    'Z'
  ].join(' ');
}

export function ManifestoDial() {
  // SVG Configuration
  const CX = 600;
  const CY = 600; // The bottom edge
  const R_IN = 94;
  const R_OUT = 190;
  const TEXT_R = 360;

  const segmentAngle = 180 / 5; // 36 degrees

  // SVG Configuration
  const segments = manifestoData.map((data, i) => {
    const startAngle = -90 + i * segmentAngle;
    const endAngle = startAngle + segmentAngle;
    const midAngle = startAngle + segmentAngle / 2;

    // We add a tiny gap between segments for visual polish
    const path = describeAnnularSector(CX, CY, R_IN, R_OUT, startAngle + 0.5, endAngle - 0.5);

    return { ...data, path, midAngle, index: i };
  });

  const [activeIndices, setActiveIndices] = useState<number[]>([]);

  React.useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let phase = 0;

    const runAnimation = () => {
      let delay = 800; // Interval for sequential reveal/hide

      if (phase === 0) setActiveIndices([0]);
      else if (phase === 1) setActiveIndices([0, 1]);
      else if (phase === 2) setActiveIndices([0, 1, 2]);
      else if (phase === 3) setActiveIndices([0, 1, 2, 3]);
      else if (phase === 4) {
        setActiveIndices([0, 1, 2, 3, 4]);
        delay = 4000; // Stay visible longer when all are shown
      } else if (phase === 5) setActiveIndices([1, 2, 3, 4]);
      else if (phase === 6) setActiveIndices([2, 3, 4]);
      else if (phase === 7) setActiveIndices([3, 4]);
      else if (phase === 8) setActiveIndices([4]);
      else if (phase === 9) {
        setActiveIndices([]);
        delay = 1000; // Brief pause when all are hidden before restarting
      }

      phase = (phase + 1) % 10;
      timeout = setTimeout(runAnimation, delay);
    };

    // Start loop
    timeout = setTimeout(runAnimation, 800);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      {/* Section Header */}
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{
          fontFamily: 'CustomHelvetica, sans-serif',
          fontSize: 'clamp(4rem, 8vw, 8rem)',
          fontWeight: 500,
          color: '#FAFAFA',
          letterSpacing: '-0.05em',
          lineHeight: 1.05,
          marginTop: '10vh',
          textAlign: 'center'
        }}
      >
        What We Believe.
      </motion.h2>

      {/* SVG Dial Container */}
      <div
        style={{
          position: 'relative',
          width: '1200px',
          height: '600px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          marginTop: 'auto'
        }}
      >
        {/* Background radial glow */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translate(-50%, 50%)',
            width: '1000px',
            height: '1000px',
            background: 'radial-gradient(circle, rgba(20,10,30,0.5) 0%, transparent 60%)',
            filter: 'blur(40px)',
            pointerEvents: 'none'
          }}
        />

        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1200 600"
          style={{ overflow: 'visible', zIndex: 1 }}
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Ring Segments */}
          {segments.map((seg) => {
            const isActive = activeIndices.includes(seg.index);

            // Number position inside the segment
            const numPos = polarToCartesian(CX, CY, (R_IN + R_OUT) / 2, seg.midAngle);

            return (
              <g key={seg.index}>
                <motion.path
                  d={seg.path}
                  fill={isActive ? 'rgba(45, 30, 60, 0.95)' : 'rgba(20, 15, 25, 0.85)'}
                  stroke={isActive ? 'rgba(150, 100, 220, 0.5)' : 'rgba(120, 80, 180, 0.2)'}
                  strokeWidth="1"
                  animate={{
                    scale: isActive ? 1.02 : 1,
                    filter: isActive
                      ? 'drop-shadow(0 0 15px rgba(120, 80, 180, 0.4))'
                      : 'drop-shadow(0 0 0px rgba(0,0,0,0))'
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  style={{ transformOrigin: '600px 600px', backdropFilter: 'blur(20px)' }}
                />

                <text
                  x={numPos.x}
                  y={numPos.y + 6} // adjust vertical center
                  fill={isActive ? '#FAFAFA' : '#71717A'}
                  fontSize="18"
                  fontWeight="500"
                  letterSpacing="0.05em"
                  textAnchor="middle"
                  style={{ pointerEvents: 'none', transition: 'fill 0.3s' }}
                >
                  {seg.num}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Absolute positioned text blocks */}
        {segments.map((seg) => {
          const isActive = activeIndices.includes(seg.index);
          const textPos = polarToCartesian(CX, CY, TEXT_R, seg.midAngle);

          // Determine text alignment based on angle
          let textAlign: 'right' | 'center' | 'left' = 'center';
          let transform = 'translate(-50%, -50%)';

          if (seg.midAngle < -15) {
            textAlign = 'right';
            transform = 'translate(-100%, -50%)';
          } else if (seg.midAngle > 15) {
            textAlign = 'left';
            transform = 'translate(0%, -50%)';
          } else {
            textAlign = 'center';
            transform = 'translate(-50%, -100%)'; // Top segment pushed up
          }

          return (
            <AnimatePresence key={`text-${seg.index}`}>
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    left: textPos.x,
                    top: textPos.y,
                    transform,
                    width: '320px',
                    textAlign,
                    pointerEvents: 'none',
                    zIndex: 10
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: 5, filter: 'blur(5px)' }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      style={{
                        fontFamily: 'CustomHelvetica, sans-serif',
                        fontSize: '1.5rem',
                        fontWeight: 500,
                        color: '#FAFAFA',
                        marginBottom: '0.5rem',
                        letterSpacing: '0.02em'
                      }}
                    >
                      {seg.title}
                    </div>
                    <div
                      style={{
                        fontSize: '0.95rem',
                        color: '#A1A1AA',
                        lineHeight: 1.6,
                        fontWeight: 300
                      }}
                    >
                      {seg.desc}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          );
        })}
      </div>
    </div>
  );
}
