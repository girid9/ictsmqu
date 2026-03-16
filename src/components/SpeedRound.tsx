import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock } from 'lucide-react';
import type { Question } from '@/lib/quizData';
import { getAnswerIndex, shuffleArray } from '@/lib/quizData';
import { playCorrect, playWrong, playTimerWarning, playTimerEnd } from '@/lib/sounds';

interface SpeedRoundProps {
  questions: Question[];
  onComplete: (correct: number, total: number) => void;
  onExit: () => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const SPEED_TIMER = 10;

interface ShuffledOption {
  text: string;
  originalIndex: number;
}

function shuffleOptions(q: Question): ShuffledOption[] {
  const opts: ShuffledOption[] = [
    { text: q.option_a, originalIndex: 0 },
    { text: q.option_b, originalIndex: 1 },
    { text: q.option_c, originalIndex: 2 },
    { text: q.option_d, originalIndex: 3 },
  ].filter(o => o.text);
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return opts;
}

const SpeedRound = ({ questions, onComplete, onExit }: SpeedRoundProps) => {
  const [shuffledQuestions] = useState(() => shuffleArray(questions));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [timer, setTimer] = useState(SPEED_TIMER);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<ShuffledOption[]>([]);

  const currentQ = shuffledQuestions[currentIndex];
  const correctIndex = currentQ ? getAnswerIndex(currentQ.answer) : 0;
  const totalQuestions = shuffledQuestions.length;

  useEffect(() => {
    if (currentQ) {
      setShuffledOptions(shuffleOptions(currentQ));
    }
  }, [currentIndex, currentQ]);

  // Timer
  useEffect(() => {
    if (showResult) return;
    setTimer(SPEED_TIMER);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          playTimerEnd();
          setShowResult(true);
          return 0;
        }
        if (prev === 4) playTimerWarning();
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, showResult]);

  const handleSelect = useCallback((optionIdx: number) => {
    if (showResult || selected !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelected(optionIdx);
    setShowResult(true);

    const selectedOption = shuffledOptions[optionIdx];
    const isCorrect = selectedOption?.originalIndex === correctIndex;

    if (isCorrect) {
      playCorrect();
      setCorrect(c => c + 1);
    } else {
      playWrong();
    }
  }, [showResult, selected, shuffledOptions, correctIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= totalQuestions) {
      onComplete(correct, totalQuestions);
      return;
    }
    setCurrentIndex(i => i + 1);
    setSelected(null);
    setShowResult(false);
  }, [currentIndex, totalQuestions, correct, onComplete]);

  // Auto-advance after showing result
  useEffect(() => {
    if (!showResult) return;
    const timeout = setTimeout(handleNext, 1200);
    return () => clearTimeout(timeout);
  }, [showResult, handleNext]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '4') {
        handleSelect(parseInt(e.key) - 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSelect]);

  if (!currentQ) return null;

  const timerPercent = (timer / SPEED_TIMER) * 100;
  const timerDanger = timer <= 3;

  return (
    <div className="max-w-lg mx-auto lg:max-w-2xl">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onExit}
          className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className={`flex items-center gap-1.5 text-sm font-bold tabular-nums ${timerDanger ? 'text-destructive' : 'text-foreground'}`}>
            <Clock className="w-4 h-4" />
            {timer}s
          </div>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1 rounded-full bg-muted overflow-hidden mb-2">
        <motion.div
          className={`h-full rounded-full ${timerDanger ? 'bg-destructive' : 'bg-foreground'}`}
          animate={{ width: `${timerPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-6">
        <span>{currentIndex + 1} of {totalQuestions}</span>
        <span>{correct} correct</span>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className="text-lg font-bold text-foreground leading-snug mb-6">
            {currentQ.question}
          </h2>

          {/* Options */}
          <div className="space-y-2.5">
            {shuffledOptions.map((option, i) => {
              const isSelected = selected === i;
              const isCorrectOption = option.originalIndex === correctIndex;
              let optionStyle = 'border-border bg-card hover:bg-muted/50 hover:border-foreground/10';
              
              if (showResult) {
                if (isCorrectOption) {
                  optionStyle = 'border-foreground bg-foreground/5';
                } else if (isSelected && !isCorrectOption) {
                  optionStyle = 'border-destructive bg-destructive/5';
                } else {
                  optionStyle = 'border-border bg-card opacity-40';
                }
              }

              return (
                <motion.button
                  key={i}
                  whileTap={!showResult ? { scale: 0.98 } : undefined}
                  onClick={() => handleSelect(i)}
                  disabled={showResult}
                  className={`w-full rounded-xl border p-3.5 text-left transition-all ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      showResult && isCorrectOption
                        ? 'bg-foreground text-background'
                        : showResult && isSelected && !isCorrectOption
                        ? 'bg-destructive text-destructive-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {OPTION_LABELS[i]}
                    </span>
                    <span className="text-sm font-medium text-foreground">{option.text}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SpeedRound;
