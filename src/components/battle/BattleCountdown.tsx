import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

interface BattleCountdownProps {
  playerName: string;
  opponentName: string;
  onComplete: () => void;
}

export default function BattleCountdown({ playerName, opponentName, onComplete }: BattleCountdownProps) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      const t = setTimeout(onComplete, 800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onComplete]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 overflow-hidden">
      <div className="flex items-center gap-6 mb-10 w-full max-w-sm">
        <motion.div
          initial={{ x: -200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="flex-1 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-2">
            <span className="text-xl font-bold text-primary">{playerName.charAt(0).toUpperCase()}</span>
          </div>
          <p className="text-sm font-bold text-foreground truncate">{playerName}</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="relative"
        >
          <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary" />
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="flex-1 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center mx-auto mb-2">
            <span className="text-xl font-bold text-destructive">{opponentName.charAt(0).toUpperCase()}</span>
          </div>
          <p className="text-sm font-bold text-foreground truncate">{opponentName}</p>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          {count > 0 ? (
            <span className="text-8xl font-black text-foreground">{count}</span>
          ) : (
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="text-5xl font-black text-primary"
            >
              GO! ⚡
            </motion.span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
