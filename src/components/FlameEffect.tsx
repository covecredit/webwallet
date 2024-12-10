import React from 'react';
import { motion } from 'framer-motion';

interface FlameEffectProps {
  x: number;
  y: number;
}

const FlameEffect: React.FC<FlameEffectProps> = ({ x, y }) => {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    angle: (Math.PI * 2 * i) / 24,
    speed: 1 + Math.random() * 0.5,
    scale: 0.5 + Math.random() * 0.3,
  }));

  return (
    <div className="fixed pointer-events-none z-50" style={{ left: x - 10, top: y - 10 }}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            scale: particle.scale,
            opacity: 0.8,
          }}
          animate={{
            x: Math.cos(particle.angle) * 40 * particle.speed,
            y: Math.sin(particle.angle) * 40 * particle.speed - 40,
            scale: 0,
            opacity: 0,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut"
          }}
          style={{
            position: 'absolute',
            width: 20,
            height: 20,
            background: `radial-gradient(circle at 50% 0%, var(--primary), rgba(var(--primary-rgb), 0.8), transparent)`,
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            filter: 'blur(2px)',
          }}
        />
      ))}
    </div>
  );
};

export default FlameEffect;