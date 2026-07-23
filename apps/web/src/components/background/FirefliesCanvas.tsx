import React, { useEffect, useRef } from 'react';

export const FirefliesCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    // Very simple state
    const fireflies = Array.from({ length: 40 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 1.5, // Faster movement
      vy: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 4 + 4, // HUGE size (4-8px)
      alpha: Math.random(),
      fadeDir: Math.random() > 0.5 ? 0.01 : -0.01
    }));

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of fireflies) {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.y > canvas.height + 20) p.y = -20;

        // Blinking
        p.alpha += p.fadeDir;
        if (p.alpha <= 0.1) {
          p.alpha = 0.1;
          p.fadeDir = Math.random() * 0.02 + 0.01;
        }
        if (p.alpha >= 1) {
          p.alpha = 1;
          p.fadeDir = -(Math.random() * 0.02 + 0.01);
        }

        // Draw BIG GLOW
        const glowRadius = p.size * 5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);

        // Warm golden glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        gradient.addColorStop(0, `rgba(255, 230, 150, ${p.alpha})`); // Bright yellow core
        gradient.addColorStop(0.3, `rgba(255, 200, 50, ${p.alpha * 0.6})`); // Golden mid
        gradient.addColorStop(1, `rgba(255, 150, 0, 0)`); // Orange edge fade

        ctx.fillStyle = gradient;
        ctx.globalCompositeOperation = 'screen';
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', // OR FIXED?
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999 // FORCE ON TOP OF EVERYTHING FOR VISIBILITY
      }}
    />
  );
};
