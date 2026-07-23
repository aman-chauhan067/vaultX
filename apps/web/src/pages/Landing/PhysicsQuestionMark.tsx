import React, { useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';
import Matter from 'matter-js';

export function PhysicsQuestionMark() {
  const containerRef = useRef<HTMLSpanElement>(null);
  const qRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (isInView && !hasTriggered.current) {
      hasTriggered.current = true;

      const containerEl = containerRef.current;
      const qEl = qRef.current;
      if (!containerEl || !qEl) return;

      // Small delay before physics starts
      setTimeout(() => {
        const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          Bodies = Matter.Bodies,
          Constraint = Matter.Constraint,
          Composite = Matter.Composite;

        const engine = Engine.create();

        const qRect = qEl.getBoundingClientRect();

        // Use relative positioning so we don't mess up document flow
        const initialX = 0;
        const initialY = 0;

        // Create the body for the '?'
        const body = Bodies.rectangle(initialX, initialY, qRect.width, qRect.height, {
          restitution: 0.5,
          friction: 0.1,
          frictionAir: 0.02, // slightly dampen swinging
          density: 0.1
        });

        // The dot of the '?' is around 85% down from the top.
        // Since the center is at 50%, the offset is 35% (0.35) of the height.
        const pivotY = qRect.height * 0.35;

        // Add a pin constraint exactly at the dot
        const pin = Constraint.create({
          pointA: { x: initialX, y: initialY + pivotY }, // anchor point in the world
          bodyB: body,
          pointB: { x: 0, y: pivotY }, // attachment point on the body
          stiffness: 1,
          length: 0,
          render: { visible: false }
        });

        Composite.add(engine.world, [body, pin]);

        const runner = Runner.create();
        Runner.run(runner, engine);

        // Apply a slight initial tap to get it swinging clockwise
        Matter.Body.applyForce(body, { x: body.position.x, y: body.position.y }, { x: 0.01, y: 0 });

        const updateLoop = () => {
          const dx = body.position.x - initialX;
          const dy = body.position.y - initialY;
          const angle = body.angle;
          // Apply transform visually
          qEl.style.transform = `translate(${dx}px, ${dy}px) rotate(${angle}rad)`;
          requestAnimationFrame(updateLoop);
        };
        updateLoop();
      }, 800); // 800ms delay before breaking
    }
  }, [isInView]);

  return (
    <span
      ref={containerRef}
      style={{ display: 'inline-flex', alignItems: 'baseline', whiteSpace: 'pre' }}
    >
      Questions
      <span
        ref={qRef}
        style={{
          display: 'inline-block',
          color: '#FAFAFA',
          transformOrigin: 'center center',
          willChange: 'transform'
        }}
      >
        ?
      </span>
    </span>
  );
}
