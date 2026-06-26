import { useMemo } from 'react';

const FloatingParticles = ({ count = 20, className = '' }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 1,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.3 + 0.1,
      color: ['cyan', 'purple', 'blue'][Math.floor(Math.random() * 3)],
    }));
  }, [count]);

  const colorMap = {
    cyan: 'bg-cyan-400',
    purple: 'bg-purple-400',
    blue: 'bg-blue-400',
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-full ${colorMap[p.color]}`}
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            opacity: p.opacity,
            animation: `float-slow ${p.duration}s ease-in-out ${p.delay}s infinite`,
            filter: `blur(${p.size > 3 ? 1 : 0}px)`,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
