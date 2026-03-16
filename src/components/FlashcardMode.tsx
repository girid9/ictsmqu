import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, RotateCcw, Eye, EyeOff } from 'lucide-react';
import type { Question } from '@/lib/quizData';
import { shuffleArray, getAnswerIndex } from '@/lib/quizData';
import { playSwipe } from '@/lib/sounds';

interface FlashcardModeProps {
  questions: Question[];
  topicName: string;
  onExit: () => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const FlashcardMode = ({ questions, topicName, onExit }: FlashcardModeProps) => {
  const cards = useMemo(() => shuffleArray(questions), [questions]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right'>('right');

  const card = cards[currentIndex];
  const correctIdx = getAnswerIndex(card.answer);
  const correctText = [card.option_a, card.option_b, card.option_c, card.option_d][correctIdx];

  const goNext = (dir: 'left' | 'right') => {
    playSwipe();
    setExitDirection(dir);
    setFlipped(false);
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex(i => i + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const goPrev = () => {
    playSwipe();
    setExitDirection('left');
    setFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    } else {
      setCurrentIndex(cards.length - 1);
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 80) {
      if (info.offset.x > 0) goPrev();
      else goNext('left');
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goPrev();
    else if (e.key === 'ArrowRight') goNext('right');
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFlipped(f => !f); }
  }, [currentIndex, cards.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col min-h-[80vh] justify-center">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onExit} className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Flashcards</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{topicName}</p>
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">
          {currentIndex + 1}/{cards.length}
        </div>
      </div>

      {/* Card with arrows */}
      <div className="flex items-center gap-3">
        {/* Left arrow - desktop only */}
        <button
          onClick={goPrev}
          className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: exitDirection === 'right' ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: exitDirection === 'right' ? -100 : 100 }}
            transition={{ duration: 0.25 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={handleDragEnd}
            onClick={() => setFlipped(!flipped)}
            className="flex-1 bg-muted/30 border border-border rounded-2xl p-8 min-h-[320px] flex flex-col justify-center cursor-pointer select-none"
            style={{ touchAction: 'pan-y' }}
          >
            <AnimatePresence mode="wait">
              {!flipped ? (
                <motion.div
                  key="front"
                  initial={{ opacity: 0, rotateY: -10 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: 10 }}
                  className="text-center space-y-4"
                >
                  <p className="text-lg font-semibold text-foreground leading-relaxed">
                    {card.question}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/50">
                    <Eye className="w-3 h-3" />
                    <span>Tap to reveal answer</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="back"
                  initial={{ opacity: 0, rotateY: 10 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: -10 }}
                  className="text-center space-y-4"
                >
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Answer</p>
                  <p className="text-xl font-bold text-foreground">
                    {OPTION_LABELS[correctIdx]}. {correctText}
                  </p>
                  {card.notes && (
                    <p className="text-xs text-muted-foreground italic mt-4 leading-relaxed">
                      {card.notes}
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/50 mt-4">
                    <EyeOff className="w-3 h-3" />
                    <span>Tap to hide · Swipe for next</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Right arrow - desktop only */}
        <button
          onClick={() => goNext('right')}
          className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Controls */}
      <div className="flex justify-center mt-6 gap-4">
        <button
          onClick={() => { setCurrentIndex(0); setFlipped(false); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restart
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1 mt-4">
        {cards.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              i === currentIndex ? 'bg-foreground' : i < currentIndex ? 'bg-foreground/30' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default FlashcardMode;
