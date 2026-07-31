import React, { useMemo, useEffect, useRef } from 'react';
import { PhysicsQuestionMark } from './PhysicsQuestionMark';
import lottie from 'lottie-web';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation, useInView, useMotionValue } from 'framer-motion';
import Matter from 'matter-js';
import { ArrowRight } from 'lucide-react';
import { useWallet } from '../../hooks/index.js';
import { Logo } from '../../components/Logo/index.js';
import { StickySection } from './StickySection';
import { AnimatedStatGrid } from './AnimatedStatGrid';
import { AnimatedComparisonTable } from './AnimatedComparisonTable';
import { ManifestoDial } from './ManifestoDial';
import { AuraButton } from './AuraButton';

function LottieAnimation({ path }: { path: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path
    });
    return () => anim.destroy();
  }, [path]);
  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

const PhysicsFallingText = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const connectRef = useRef<HTMLDivElement>(null);
  const reviewRef = useRef<HTMLDivElement>(null);
  const approveRef = useRef<HTMLDivElement>(null);

  const isFalling = useInView(triggerRef, { once: true, margin: '-10% 0px -10% 0px' });
  const hasTriggered = useRef(false);

  const cx = useMotionValue(0);
  const cy = useMotionValue(0);
  const cr = useMotionValue(0);

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rr = useMotionValue(0);

  const ax = useMotionValue(0);
  const ay = useMotionValue(0);
  const ar = useMotionValue(0);

  useEffect(() => {
    if (isFalling && !hasTriggered.current) {
      hasTriggered.current = true;

      const connectEl = connectRef.current;
      const reviewEl = reviewRef.current;
      const approveEl = approveRef.current;
      const containerEl = containerRef.current;

      if (!connectEl || !reviewEl || !approveEl || !containerEl) return;

      const containerRect = containerEl.getBoundingClientRect();
      const cRect = connectEl.getBoundingClientRect();
      const rRect = reviewEl.getBoundingClientRect();
      const aRect = approveEl.getBoundingClientRect();

      const getLocalCenter = (rect: DOMRect) => ({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height / 2,
        w: rect.width * 0.85,
        h: rect.height * 0.6 // Reduced height so texts stack without gaps
      });

      const cCenter = getLocalCenter(cRect);
      const rCenter = getLocalCenter(rRect);
      const aCenter = getLocalCenter(aRect);

      const Engine = Matter.Engine,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite;

      const engine = Engine.create();

      const groundY = aCenter.y + aRect.height / 2 + 64;
      const ground = Bodies.rectangle(
        containerRect.width / 2,
        groundY + 50,
        containerRect.width * 2,
        100,
        { isStatic: true }
      );

      // Add random offset, angle, and angular velocity so they fall scattered and tilted
      const createTextBody = (center: any) => {
        const body = Bodies.rectangle(
          center.x + (Math.random() * 40 - 20), // X offset
          center.y,
          center.w,
          center.h,
          {
            restitution: 0.2,
            friction: 0.8,
            density: 0.05,
            angle: Math.random() * 0.3 - 0.15 // Initial tilt
          }
        );
        Matter.Body.setAngularVelocity(body, Math.random() * 0.06 - 0.03);
        return body;
      };

      const cBody = createTextBody(cCenter);
      const rBody = createTextBody(rCenter);
      const aBody = createTextBody(aCenter);

      Composite.add(engine.world, [ground, aBody]);

      setTimeout(() => Composite.add(engine.world, [rBody]), 200);
      setTimeout(() => Composite.add(engine.world, [cBody]), 400);

      const runner = Runner.create();
      Runner.run(runner, engine);

      const updateLoop = () => {
        if (cBody.parent) {
          cx.set(cBody.position.x - cCenter.x);
          cy.set(cBody.position.y - cCenter.y);
          cr.set(cBody.angle * (180 / Math.PI));
        }
        if (rBody.parent) {
          rx.set(rBody.position.x - rCenter.x);
          ry.set(rBody.position.y - rCenter.y);
          rr.set(rBody.angle * (180 / Math.PI));
        }
        if (aBody.parent) {
          ax.set(aBody.position.x - aCenter.x);
          ay.set(aBody.position.y - aCenter.y);
          ar.set(aBody.angle * (180 / Math.PI));
        }
        requestAnimationFrame(updateLoop);
      };
      updateLoop();
    }
  }, [isFalling, ax, ay, ar, cx, cy, cr, rx, ry, rr]);

  return (
    <div ref={containerRef} style={{ position: 'relative', zIndex: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div
            ref={connectRef}
            style={{
              x: cx,
              y: cy,
              rotate: cr,
              fontFamily: 'CustomHelvetica, sans-serif',
              fontSize: 'clamp(4rem, 8vw, 8rem)',
              fontWeight: 500,
              color: '#FAFAFA',
              letterSpacing: '-0.05em',
              lineHeight: 1.05
            }}
          >
            Connect.
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            ref={reviewRef}
            style={{
              x: rx,
              y: ry,
              rotate: rr,
              fontFamily: 'CustomHelvetica, sans-serif',
              fontSize: 'clamp(4rem, 8vw, 8rem)',
              fontWeight: 500,
              color: '#FAFAFA',
              letterSpacing: '-0.05em',
              lineHeight: 1.05
            }}
          >
            Review.
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0 }}
        >
          <motion.div
            ref={approveRef}
            style={{
              x: ax,
              y: ay,
              rotate: ar,
              fontFamily: 'CustomHelvetica, sans-serif',
              fontSize: 'clamp(4rem, 8vw, 8rem)',
              fontWeight: 500,
              color: '#FAFAFA',
              letterSpacing: '-0.05em',
              lineHeight: 1.05
            }}
          >
            Approve.
          </motion.div>
        </motion.div>
      </div>
      <div
        ref={triggerRef}
        style={{ position: 'absolute', top: '120%', left: 0, width: '100%', height: '10px' }}
      />
    </div>
  );
};

const PhysicsUnbreakableText = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLDivElement | null)[]>([]);

  const isTriggered = useInView(triggerRef, { once: true, margin: '-10% 0px -10% 0px' });
  const hasTriggered = useRef(false);
  const controls = useAnimation();

  const text1 = 'Engineered to'.split('');
  const text2 = 'be'.split('');

  useEffect(() => {
    if (isTriggered && !hasTriggered.current) {
      hasTriggered.current = true;

      const explode = async () => {
        // Phase 1: Subtle Shake
        await controls.start({
          x: [0, -3, 3, -3, 3, -2, 2, 0],
          y: [0, 2, -2, 2, -2, 1, -1, 0],
          transition: { duration: 0.4 }
        });

        // Phase 2: Subtle Expand
        await controls.start({
          scale: 1.1,
          transition: { duration: 0.15 }
        });

        // Phase 3: Physics Explosion
        const containerEl = containerRef.current;
        if (!containerEl) return;

        const containerRect = containerEl.getBoundingClientRect();

        const Engine = Matter.Engine,
          Runner = Matter.Runner,
          Bodies = Matter.Bodies,
          Composite = Matter.Composite;

        const engine = Engine.create();
        const bodies: {
          body: Matter.Body;
          el: HTMLDivElement;
          initialX: number;
          initialY: number;
        }[] = [];

        charRefs.current.forEach((el) => {
          if (!el || el.innerHTML === '&nbsp;') return;

          const rect = el.getBoundingClientRect();
          const cx = rect.left - containerRect.left + rect.width / 2;
          const cy = rect.top - containerRect.top + rect.height / 2;

          const body = Bodies.rectangle(cx, cy, rect.width * 0.8, rect.height * 0.8, {
            restitution: 0.6,
            friction: 0.1,
            density: 0.05
          });

          const forceMagnitude = 0.02 + Math.random() * 0.015;
          const angle = Math.random() * Math.PI * 2;
          Matter.Body.applyForce(body, body.position, {
            x: Math.cos(angle) * forceMagnitude,
            y: Math.sin(angle) * forceMagnitude - 0.03
          });

          Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.4);

          bodies.push({ body, el, initialX: cx, initialY: cy });
          Composite.add(engine.world, body);
        });

        // Set the ground to the top of the footer
        let groundY = containerRect.height + 2000; // fallback
        const footerEl = document.getElementById('site-footer');
        if (footerEl) {
          const containerTop = containerEl.getBoundingClientRect().top + window.scrollY;
          const footerTop = footerEl.getBoundingClientRect().top + window.scrollY;
          // Coordinates are local to containerRect.
          groundY = footerTop - containerTop;
        }

        const ground = Bodies.rectangle(
          containerRect.width / 2,
          groundY,
          containerRect.width * 3,
          100,
          { isStatic: true }
        );

        const leftWall = Bodies.rectangle(-100, groundY / 2, 200, groundY, { isStatic: true });
        const rightWall = Bodies.rectangle(containerRect.width + 100, groundY / 2, 200, groundY, {
          isStatic: true
        });

        Composite.add(engine.world, [ground, leftWall, rightWall]);

        const runner = Runner.create();
        Runner.run(runner, engine);

        const updateLoop = () => {
          bodies.forEach(({ body, el, initialX, initialY }) => {
            const dx = body.position.x - initialX;
            const dy = body.position.y - initialY;
            const angle = body.angle;
            el.style.transform = `translate(${dx}px, ${dy}px) rotate(${angle}rad) scale(1.1)`;
          });
          requestAnimationFrame(updateLoop);
        };
        updateLoop();
      };

      explode();
    }
  }, [isTriggered, controls]);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontFamily: 'CustomHelvetica, sans-serif',
          fontSize: 'clamp(4rem, 8vw, 8rem)',
          fontWeight: 500,
          color: '#FAFAFA',
          letterSpacing: '-0.05em',
          lineHeight: 1.05
        }}
      >
        <div style={{ display: 'flex' }}>
          {text1.map((char, i) => (
            <motion.div
              key={`t1-${i}`}
              ref={(el) => (charRefs.current[i] = el)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              animate={controls}
              style={{ display: 'inline-block', whiteSpace: 'pre' }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'flex' }}>
          {text2.map((char, i) => (
            <motion.div
              key={`t2-${i}`}
              ref={(el) => (charRefs.current[text1.length + i] = el)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              animate={controls}
              style={{ display: 'inline-block', whiteSpace: 'pre' }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Unbreakable.
        </motion.div>
      </div>
      <div
        ref={triggerRef}
        style={{ position: 'absolute', top: '150%', left: 0, width: '100%', height: '10px' }}
      />
    </div>
  );
};

export default function Landing() {
  const navigate = useNavigate();
  const { hasVault } = useWallet();

  const handleStart = () => {
    if (hasVault) {
      navigate('/unlock');
    } else {
      navigate('/create-wallet');
    }
  };

  const [starsSmall1, starsSmall2, starsMedium1, starsMedium2, starsLarge] = useMemo(() => {
    const generate = (count: number) => {
      // Spread stars over 200vw/vh to allow for seamless panning
      let value = `${Math.floor(Math.random() * 200)}vw ${Math.floor(Math.random() * 200)}vh #FFF`;
      for (let i = 1; i < count; i++) {
        value += `, ${Math.floor(Math.random() * 200)}vw ${Math.floor(Math.random() * 200)}vh #FFF`;
      }
      return value;
    };
    return [generate(75), generate(75), generate(35), generate(35), generate(30)];
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 1 } }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        color: 'var(--color-text-primary)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Sticky Background Layer */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: '100vh',
          zIndex: -1,
          background: `radial-gradient(circle at 50% 0%, rgba(40, 20, 80, 0.5) 0%, rgba(0, 0, 0, 1) 80%), url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`
        }}
      >
        <style>{`
          @keyframes twinkle {
            0% { opacity: 0.1; }
            50% { opacity: 1; }
            100% { opacity: 0.1; }
          }
          @keyframes drift {
            from { transform: translateY(0); }
            to { transform: translateY(-100vh); }
          }
        `}</style>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '200vh',
              animation: 'drift 150s linear infinite'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '1px',
                height: '1px',
                background: 'transparent',
                boxShadow: starsSmall1,
                animation: 'twinkle 3s infinite ease-in-out'
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '1px',
                height: '1px',
                background: 'transparent',
                boxShadow: starsSmall2,
                animation: 'twinkle 4.5s infinite ease-in-out 1.2s'
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '2px',
                height: '2px',
                background: 'transparent',
                boxShadow: starsMedium1,
                animation: 'twinkle 4s infinite ease-in-out 0.5s'
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '2px',
                height: '2px',
                background: 'transparent',
                boxShadow: starsMedium2,
                animation: 'twinkle 5.5s infinite ease-in-out 2.5s'
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '3px',
                height: '3px',
                background: 'transparent',
                boxShadow: starsLarge,
                animation: 'twinkle 6s infinite ease-in-out 1.8s',
                borderRadius: '50%'
              }}
            />
          </div>
        </div>
      </div>

      {/* Scrollable Content Overlay */}
      <div
        style={{
          marginTop: '-100vh',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%'
        }}
      >
        {/* Hero Section */}
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            backgroundColor: 'transparent'
          }}
        >
          {/* Top Nav */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '2rem 5vw',
              zIndex: 10
            }}
          >
            <Logo size="md" variant="light" />
            <div
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#8A8A93'
              }}
            >
              Next Generation Self-Custody
            </div>
          </motion.div>

          {/* Atmospheric Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '20%',
              left: '30%',
              width: '40vw',
              height: '40vw',
              background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)',
              filter: 'blur(80px)',
              zIndex: 0
            }}
          />

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '0 5vw',
              zIndex: 10
            }}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              style={{ maxWidth: '1000px' }}
            >
              {/* Accent Brand Font */}
              <motion.div
                variants={itemVariants}
                style={{
                  fontFamily: 'var(--font-brand)',
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  color: '#8A8A93',
                  marginBottom: '2rem'
                }}
              >
                Enter the Vault
              </motion.div>

              {/* Core Helvetica Typography */}
              <motion.div
                variants={itemVariants}
                style={{
                  fontSize: 'clamp(4rem, 8vw, 8rem)',
                  fontWeight: 500,
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                  marginBottom: '4rem'
                }}
              >
                Own your wealth.
                <br />
                Without compromise.
              </motion.div>

              <motion.div
                variants={itemVariants}
                style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}
              >
                {hasVault ? (
                  <>
                    <div
                      onClick={() => navigate('/unlock')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1.25rem 3rem',
                        borderRadius: '100px',
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontWeight: 600,
                        transition: 'transform 0.3s, background 0.3s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                    >
                      Unlock Vault <ArrowRight size={18} />
                    </div>
                    <div
                      onClick={() => navigate('/import-wallet')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1.25rem 3rem',
                        borderRadius: '100px',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'var(--color-text-primary)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontWeight: 600,
                        transition: 'transform 0.3s, background 0.3s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      Restore Backup
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      onClick={() => navigate('/create-wallet')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1.25rem 3rem',
                        borderRadius: '100px',
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontWeight: 600,
                        transition: 'transform 0.3s, background 0.3s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                    >
                      Create Wallet <ArrowRight size={18} />
                    </div>
                    <div
                      onClick={() => navigate('/import-wallet')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1.25rem 3rem',
                        borderRadius: '100px',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'var(--color-text-primary)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontWeight: 600,
                        transition: 'transform 0.3s, background 0.3s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      Import Wallet
                    </div>
                    <div
                      onClick={() => {
                        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      style={{
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: '#8A8A93',
                        transition: 'color 0.3s',
                        padding: '1.25rem 0',
                        marginLeft: '1rem'
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.color = '#ffffff')}
                      onMouseOut={(e) => (e.currentTarget.style.color = '#8A8A93')}
                    >
                      Learn More
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* ── Section 2: About ── */}
        <StickySection>
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6rem',
                alignItems: 'center',
                width: '100%',
                maxWidth: '1200px'
              }}
            >
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                style={{ flex: '1 1 500px' }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#3F3F46',
                    marginBottom: '1.5rem'
                  }}
                >
                  THE PHILOSOPHY
                </div>
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
                    letterSpacing: '-0.04em',
                    lineHeight: 1.1,
                    marginBottom: '2.5rem'
                  }}
                >
                  Your keys should
                  <br />
                  never leave your hands.
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  style={{
                    color: '#71717A',
                    lineHeight: 1.8,
                    fontSize: '1.125rem',
                    marginBottom: '1.5rem',
                    maxWidth: '560px'
                  }}
                >
                  Every day, millions of people trust centralized platforms with their private keys.
                  They trade ownership for convenience. And when those platforms fail — and they do
                  — billions disappear overnight.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  style={{
                    color: '#71717A',
                    lineHeight: 1.8,
                    fontSize: '1.125rem',
                    marginBottom: '1.5rem',
                    maxWidth: '560px'
                  }}
                >
                  We believe that financial sovereignty isn't a feature. It's a fundamental right.
                  Your private keys are the only proof of ownership in a decentralized world.
                  Handing them to someone else defeats the entire purpose.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.45 }}
                  style={{
                    color: '#71717A',
                    lineHeight: 1.8,
                    fontSize: '1.125rem',
                    maxWidth: '560px'
                  }}
                >
                  VaultX was built for people who understand this. It's not the easiest wallet. It's
                  the most honest one. Everything happens on your device. Nothing is transmitted.
                  Nothing is stored. Nothing is compromised.
                </motion.p>
              </motion.div>
              {/* Lottie removed */}
            </div>
          </div>
        </StickySection>

        {/* ── Section 3: Total Ownership ── */}
        <StickySection>
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: '700px', marginBottom: '4rem' }}>
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
                  marginBottom: '1.5rem'
                }}
              >
                Total Ownership.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{ color: '#71717A', fontSize: '1.125rem', lineHeight: 1.6 }}
              >
                Your cryptographic keys are generated, encrypted, and stored entirely on your
                device.
              </motion.p>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '2rem',
                width: '100%',
                maxWidth: '960px',
                margin: '0 auto'
              }}
            >
              {[
                {
                  title: 'Local Encryption',
                  body: 'AES-256-GCM encryption protects your seed phrase. Keys are derived using BIP-39 and never serialized in plaintext.'
                },
                {
                  title: 'Zero Transmission',
                  body: 'No data leaves your device. No analytics. No telemetry. No remote key storage. Your wallet exists only where you are.'
                },
                {
                  title: 'Device-Bound Signing',
                  body: 'Every transaction is signed locally. Private keys are never exposed to the network, the browser, or any third party.'
                }
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="feature-glow-card"
                  style={{ textAlign: 'center' }}
                >
                  <h3
                    style={{
                      fontFamily: 'CustomHelvetica, sans-serif',
                      fontSize: '1.15rem',
                      fontWeight: 600,
                      color: '#FAFAFA',
                      marginBottom: '1rem'
                    }}
                  >
                    {card.title}
                  </h3>
                  <p style={{ color: '#71717A', lineHeight: 1.6, fontSize: '0.875rem' }}>
                    {card.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </StickySection>

        {/* ── Section 4: Omni-Chain ── */}
        <StickySection>
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6rem',
                alignItems: 'center',
                width: '100%',
                maxWidth: '1200px'
              }}
            >
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                style={{ flex: '1 1 500px' }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#3F3F46',
                    marginBottom: '1.5rem'
                  }}
                >
                  NETWORKS
                </div>
                <motion.div
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
                    lineHeight: 1.2,
                    marginBottom: '2rem'
                  }}
                >
                  <div className="text-flip-container" style={{ height: '1.3em' }}>
                    <div className="text-flip-inner">
                      <div className="text-flip-front">One Wallet.</div>
                      <div className="text-flip-back" style={{ paddingBottom: '0.1em' }}>
                        Every Chain.
                      </div>
                    </div>
                  </div>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  style={{
                    color: '#71717A',
                    lineHeight: 1.8,
                    fontSize: '1.3rem',
                    maxWidth: '520px'
                  }}
                >
                  Switch between Ethereum, Arbitrum, Polygon, Optimism, and Base in a single tap.
                  Add custom RPCs. VaultX adapts to the chain — never the other way around.
                </motion.p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{
                  flex: '1 1 400px',
                  display: 'flex',
                  justifyContent: 'center',
                  position: 'relative',
                  minHeight: '400px'
                }}
              >
                {/* Floating Bubble Logos Placeholder */}
                <div
                  className="floating-logo"
                  style={{
                    top: '10%',
                    left: '15%',
                    animationDelay: '0s',
                    width: '140px',
                    height: '140px'
                  }}
                >
                  <img src="/eth.png" alt="ETH" />
                </div>
                <div
                  className="floating-logo"
                  style={{
                    top: '45%',
                    left: '70%',
                    animationDelay: '1.5s',
                    width: '180px',
                    height: '180px'
                  }}
                >
                  <img src="/arb.png" alt="ARB" />
                </div>
                <div
                  className="floating-logo"
                  style={{
                    top: '65%',
                    left: '25%',
                    animationDelay: '3s',
                    width: '160px',
                    height: '160px'
                  }}
                >
                  <img src="/matic.png" alt="POL" />
                </div>
                <div
                  className="floating-logo"
                  style={{
                    top: '20%',
                    left: '60%',
                    animationDelay: '4.5s',
                    width: '120px',
                    height: '120px'
                  }}
                >
                  <img src="/op.png" alt="OP" />
                </div>
              </motion.div>
            </div>
          </div>
        </StickySection>

        {/* ── Section 5: dApp Flow ── */}
        <StickySection>
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: '600px', marginBottom: '4rem' }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#3F3F46',
                  marginBottom: '1.5rem'
                }}
              >
                HOW IT WORKS
              </div>
              <PhysicsFallingText />
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '2rem',
                maxWidth: '1000px',
                width: '100%'
              }}
            >
              {[
                {
                  step: '01',
                  label: 'Connect',
                  caption: 'dApp requests wallet access via EIP-1193 provider.'
                },
                {
                  step: '02',
                  label: 'Review',
                  caption: 'Transaction details are decoded and presented in plain language.'
                },
                {
                  step: '03',
                  label: 'Approve',
                  caption: 'You sign locally. Nothing is sent until you confirm.'
                },
                {
                  step: '04',
                  label: 'Done',
                  caption: 'Transaction broadcasts to the network. Receipt is logged.'
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="step-glow-card"
                  style={{
                    flex: '1 1 200px',
                    maxWidth: '220px',
                    textAlign: 'center',
                    padding: '2rem 1.5rem',
                    borderRadius: '16px'
                  }}
                >
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: '#3F3F46',
                      fontFamily: 'CustomHelvetica, sans-serif',
                      marginBottom: '0.75rem'
                    }}
                  >
                    {item.step}
                  </div>
                  <div
                    style={{
                      fontFamily: 'CustomHelvetica, sans-serif',
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: '#FAFAFA',
                      marginBottom: '0.5rem'
                    }}
                  >
                    {item.label}
                  </div>
                  <p style={{ color: '#71717A', fontSize: '0.875rem', lineHeight: 1.6 }}>
                    {item.caption}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </StickySection>

        {/* ── Section 6: Security Architecture ── */}
        <StickySection>
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: '700px', marginBottom: '3rem' }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#3F3F46',
                  marginBottom: '1.5rem'
                }}
              >
                ARCHITECTURE
              </div>
              <PhysicsUnbreakableText />
            </div>
            {/* Architecture flow */}
            <motion.div
              id="architecture-flow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '0',
                maxWidth: '1000px',
                width: '100%',
                marginBottom: '4rem',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              {[
                'Seed Phrase',
                'PBKDF2 Derivation',
                'AES-256-GCM',
                'Local Store',
                'Local Signing',
                'Network'
              ].map((step, i) => (
                <div
                  key={i}
                  style={{
                    flex: '1 1 140px',
                    padding: '1.25rem 1rem',
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: '#71717A',
                    borderRight: i < 5 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    letterSpacing: '0.02em'
                  }}
                >
                  {step}
                </div>
              ))}
            </motion.div>
            {/* Feature Carousel */}
            <div className="marquee-container">
              <div className="marquee-track">
                {[
                  {
                    title: 'AES-256-GCM',
                    body: 'Military-grade symmetric encryption for vault storage.'
                  },
                  {
                    title: 'BIP-39 / BIP-44',
                    body: 'Industry-standard key derivation paths for wallet generation.'
                  },
                  {
                    title: 'Auto-Lock',
                    body: 'Configurable timeout clears decrypted keys from memory.'
                  },
                  {
                    title: 'Open Source',
                    body: 'Every line of code is auditable. Trust is earned, not assumed.'
                  },
                  {
                    title: 'AES-256-GCM',
                    body: 'Military-grade symmetric encryption for vault storage.'
                  },
                  {
                    title: 'BIP-39 / BIP-44',
                    body: 'Industry-standard key derivation paths for wallet generation.'
                  },
                  {
                    title: 'Auto-Lock',
                    body: 'Configurable timeout clears decrypted keys from memory.'
                  },
                  {
                    title: 'Open Source',
                    body: 'Every line of code is auditable. Trust is earned, not assumed.'
                  }
                ].map((card, i) => (
                  <div
                    key={i}
                    className="step-glow-card"
                    style={{
                      flex: '0 0 280px',
                      padding: '2rem',
                      borderRadius: '16px',
                      textAlign: 'left'
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: 'CustomHelvetica, sans-serif',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: '#FAFAFA',
                        marginBottom: '0.75rem'
                      }}
                    >
                      {card.title}
                    </h3>
                    <p style={{ color: '#71717A', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      {card.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </StickySection>

        {/* ── Section 7: Performance ── */}
        <StickySection>
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: '700px', marginBottom: '4rem' }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#3F3F46',
                  marginBottom: '1.5rem'
                }}
              >
                PERFORMANCE
              </div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                style={{
                  fontFamily: 'CustomHelvetica, sans-serif',
                  fontSize: 'clamp(3rem, 6vw, 5rem)',
                  fontWeight: 500,
                  color: '#FAFAFA',
                  letterSpacing: '-0.04em',
                  lineHeight: 1.1
                }}
              >
                Speed without compromise.
              </motion.h2>
            </div>
            <AnimatedStatGrid />
          </div>
        </StickySection>

        {/* ── Section 8: Comparison ── */}
        <StickySection>
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
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
                marginBottom: '4rem',
                textAlign: 'center'
              }}
            >
              A Different Standard.
            </motion.h2>
            <AnimatedComparisonTable />
          </div>
        </StickySection>

        {/* ── Section 9: Design Principles ── */}
        <StickySection>
          <ManifestoDial />
        </StickySection>

        {/* ── Section 10: FAQ ── */}
        <StickySection>
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
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
                marginBottom: '3rem',
                textAlign: 'center'
              }}
            >
              <PhysicsQuestionMark />
            </motion.h2>
            <div style={{ width: '100%', maxWidth: '720px' }}>
              {[
                {
                  q: 'Is VaultX open source?',
                  a: 'Yes. Every line of code is public and auditable on GitHub. We believe transparency is the foundation of trust.'
                },
                {
                  q: 'Where are my private keys stored?',
                  a: 'Exclusively on your device. Keys are encrypted using AES-256-GCM and never leave local storage. There are no servers involved.'
                },
                {
                  q: 'Which networks does VaultX support?',
                  a: 'All EVM-compatible networks — Ethereum, Arbitrum, Polygon, Optimism, Base, and any custom RPC you configure.'
                },
                {
                  q: 'Do I need to create an account?',
                  a: 'No. VaultX has no accounts, no emails, no KYC. You generate a wallet and start using it immediately.'
                },
                {
                  q: 'Can I use VaultX with dApps?',
                  a: 'Yes. VaultX provides a standard EIP-1193 provider that works with any decentralized application.'
                }
              ].map((faq, i) => (
                <motion.details
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}
                >
                  <summary
                    style={{
                      padding: '1.5rem 0',
                      fontSize: '1.05rem',
                      fontWeight: 500,
                      color: '#FAFAFA',
                      listStyle: 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    {faq.q}{' '}
                    <span style={{ color: '#3F3F46', fontSize: '1.25rem', fontWeight: 300 }}>
                      +
                    </span>
                  </summary>
                  <p
                    style={{
                      color: '#71717A',
                      fontSize: '0.95rem',
                      lineHeight: 1.7,
                      paddingBottom: '1.5rem'
                    }}
                  >
                    {faq.a}
                  </p>
                </motion.details>
              ))}
            </div>
          </div>
        </StickySection>
        {/* ── Section 11: Final CTA ── */}
        <StickySection>
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              style={{
                fontFamily: 'CustomHelvetica, sans-serif',
                fontSize: 'clamp(4rem, 8vw, 8rem)',
                fontWeight: 500,
                color: '#FAFAFA',
                letterSpacing: '-0.05em',
                lineHeight: 1.05,
                marginBottom: '1rem',
                position: 'relative',
                zIndex: 1
              }}
            >
              Take Back Control.
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{ position: 'relative', zIndex: 1 }}
            >
              <AuraButton />
            </motion.div>
          </div>
        </StickySection>

        {/* Footer Section */}
        <footer
          id="site-footer"
          style={{
            padding: '3rem 5vw',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            zIndex: 10,
            gap: '2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src="/logo.png"
              alt="VaultX"
              style={{ width: '24px', height: '24px', objectFit: 'contain' }}
            />
            <span
              style={{
                fontFamily: 'var(--font-brand)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)'
              }}
            >
              VaultX
            </span>
          </div>

          <div style={{ fontSize: '0.875rem', color: '#8A8A93' }}>
            &copy; {new Date().getFullYear()} VaultX. All rights reserved.
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: '#8A8A93' }}>
            <span
              style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#8A8A93')}
            >
              Twitter
            </span>
            <span
              style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#8A8A93')}
            >
              Discord
            </span>
            <span
              style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#8A8A93')}
            >
              GitHub
            </span>
            <span
              style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#8A8A93')}
            >
              Docs
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
