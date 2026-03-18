import { useState } from 'react';
import { motion } from 'framer-motion';

const EMOJIS = ['🎉', '🎊', '✨', '⭐', '🌟', '💫', '🔥', '💯', '🏆', '🎯', '💎', '👑', '🚀', '⚡', '🎮'];

const Confetti = () => {
  const [particles] = useState(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      size: Math.random() * 12 + 14,
      drift: (Math.random() - 0.5) * 100,
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -30, x: `${p.x}vw`, opacity: 1, rotate: 0, scale: 0 }}
          animate={{
            y: '110vh',
            x: `calc(${p.x}vw + ${p.drift}px)`,
            opacity: [1, 1, 0],
            rotate: Math.random() > 0.5 ? 360 : -360,
            scale: [0, 1.2, 1, 0.8],
          }}
          transition={{ duration: 2.5, delay: p.delay, ease: 'easeOut' }}
          className="absolute"
          style={{ fontSize: p.size }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
};

export default Confetti;
