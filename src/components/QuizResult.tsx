import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Home, ChevronRight, XCircle } from 'lucide-react';
import Confetti from '@/components/Confetti';
import { playVictory, playDefeat, playPerfectScore, playResultReveal } from '@/lib/sounds';

interface QuizResultProps {
  correct: number;
  total: number;
  missedQuestions?: { question: string; answer: string; selected: string }[];
  onRetry: () => void;
  onHome: () => void;
  onNextTopic?: () => void;
  nextTopicName?: string;
}

const QuizResult = ({ correct, total, missedQuestions = [], onRetry, onHome, onNextTopic, nextTopicName }: QuizResultProps) => {
  const percentage = Math.round((correct / total) * 100);
  const showConfetti = percentage >= 80;

  useEffect(() => {
    if (percentage === 100) playPerfectScore();
    else if (percentage >= 50) { playResultReveal(); setTimeout(playVictory, 300); }
    else playDefeat();
  }, []);

  const getMessage = () => {
    if (percentage === 100) return { emoji: '🏆', text: 'Perfect!' };
    if (percentage >= 80) return { emoji: '🎯', text: 'Great Job!' };
    if (percentage >= 50) return { emoji: '⭐', text: 'Well Done!' };
    return { emoji: '💪', text: 'Keep Trying!' };
  };

  const msg = getMessage();

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 15 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.1 }}
      className="w-full max-w-sm mx-auto text-center flex flex-col items-center justify-center min-h-[80vh] space-y-5"
    >
      {showConfetti && <Confetti />}

      <motion.div variants={itemVariants} className="text-7xl">{msg.emoji}</motion.div>

      <motion.div variants={itemVariants} className="space-y-1">
        <h2 className="text-2xl font-black text-foreground">{msg.text}</h2>
        <p className="text-muted-foreground text-sm">{correct}/{total} correct · {percentage}%</p>
        {correct === total && total > 0 && (
          <p className="text-sm font-bold text-gold mt-1">🪙 +100 coins bonus!</p>
        )}
      </motion.div>

      {/* Wrong Answers Review */}
      {missedQuestions.length > 0 && (
        <motion.div variants={itemVariants} className="w-full space-y-3 text-left">
          <h3 className="text-sm font-bold text-destructive flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Wrong Answers ({missedQuestions.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {missedQuestions.map((m, i) => (
              <div key={i} className="bg-destructive/5 border border-destructive/20 rounded-xl p-3 space-y-1.5">
                <p className="text-xs font-semibold text-foreground">{m.question}</p>
                <p className="text-xs text-destructive font-medium">✗ Your answer: {m.selected}</p>
                <p className="text-xs text-success font-medium">✓ Correct: {m.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3 w-full pt-2">
        {onNextTopic && nextTopicName && (
          <button
            onClick={onNextTopic}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-sm material-shadow-1"
          >
            Next Topic <ChevronRight className="w-4 h-4" />
          </button>
        )}

        <div className="flex gap-3 w-full">
          <button
            onClick={onHome}
            className="flex-1 py-3.5 rounded-xl bg-muted font-semibold text-foreground flex items-center justify-center gap-2 hover:bg-muted/80 transition-colors text-sm border border-border"
          >
            <Home className="w-4 h-4" /> Home
          </button>
          <button
            onClick={onRetry}
            className="flex-1 py-3.5 rounded-xl bg-card font-semibold text-foreground flex items-center justify-center gap-2 hover:bg-muted/80 transition-colors text-sm border border-border"
          >
            <RotateCcw className="w-4 h-4" /> Retry
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuizResult;
