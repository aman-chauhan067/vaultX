import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

export interface PremiumBackgroundProps {
  className?: string;
  enabled?: boolean;
}

export const PremiumBackground: React.FC<PremiumBackgroundProps> = ({
  className,
  enabled = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const cursorRef = useRef({ x: -1000, y: -1000 }); // start offscreen

  useEffect(() => {
    if (!canvasRef.current || !enabled) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Config
    const STAR_COUNT = 150;
    const PARTICLE_COUNT = 15;

    // State
    const stars: {
      x: number;
      y: number;
      size: number;
      baseAlpha: number;
      phase: number;
      speed: number;
    }[] = [];
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
    }[] = [];

    const init = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      // Initialize Stars
      stars.length = 0;
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.5,
          baseAlpha: Math.random() * 0.5 + 0.1,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.02 + 0.005
        });
      }

      // Initialize Particles
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2 - 0.1, // slightly upwards
          size: Math.random() * 2 + 1,
          alpha: Math.random() * 0.3 + 0.1
        });
      }
    };

    init();
    window.addEventListener('resize', init);

    const onMouseMove = (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseLeave = () => {
      cursorRef.current = { x: -1000, y: -1000 };
    };
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    let time = 0;

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw soft animated gradient (Aurora overlay)
      if (!shouldReduceMotion) {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, `rgba(168, 85, 247, ${0.03 + Math.sin(time * 0.005) * 0.01})`);
        gradient.addColorStop(0.5, `rgba(59, 130, 246, ${0.02 + Math.cos(time * 0.007) * 0.01})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Draw Stars (Twinkling)
      stars.forEach((star) => {
        let alpha = star.baseAlpha;
        if (!shouldReduceMotion) {
          star.phase += star.speed;
          alpha = star.baseAlpha + Math.sin(star.phase) * 0.3;
          if (alpha < 0) alpha = 0;
          if (alpha > 1) alpha = 1;
        }

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Draw Particles (Floating)
      if (!shouldReduceMotion) {
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;

          // Wrap around edges
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.beginPath();
          ctx.fillStyle = `rgba(168, 85, 247, ${p.alpha})`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

          // Slight glow
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(168, 85, 247, 0.8)';
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        });
      }

      // 4. Draw Mouse Spotlight
      const cursor = cursorRef.current;
      if (!shouldReduceMotion && cursor.x !== -1000) {
        const radGrad = ctx.createRadialGradient(cursor.x, cursor.y, 0, cursor.x, cursor.y, 400);
        radGrad.addColorStop(0, 'rgba(168, 85, 247, 0.08)');
        radGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.03)');
        radGrad.addColorStop(1, 'transparent');

        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';
      }

      if (!shouldReduceMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    // Initial render
    render();

    return () => {
      window.removeEventListener('resize', init);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [enabled, shouldReduceMotion]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1 // Above CSS aurora, beneath UI
      }}
    />
  );
};
