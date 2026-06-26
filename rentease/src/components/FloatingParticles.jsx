import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const icons = ['💻', '📷', '📽️', '📱', '🎮', '🖥️', '🖨️', '🎧', '📸', '🕹️'];

export default function FloatingParticles({ count = 15 }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const arr = Array.from({ length: count }, (_, i) => ({
      id: i,
      icon: icons[i % icons.length],
      x: Math.random() * 100,
      size: 16 + Math.random() * 24,
      duration: 12 + Math.random() * 18,
      delay: Math.random() * 10,
      floatDuration: 4 + Math.random() * 4,
    }));
    setParticles(arr);
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            bottom: '-5%',
            fontSize: `${p.size}px`,
            opacity: 0.15,
          }}
          animate={{
            y: [0, -window.innerHeight - 100],
            rotate: [0, 360],
          }}
          transition={{
            y: {
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'linear',
            },
            rotate: {
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'linear',
            },
          }}
        >
          {p.icon}
        </motion.div>
      ))}
    </div>
  );
}
