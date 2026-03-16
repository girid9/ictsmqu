import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Settings, Lightbulb } from 'lucide-react';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import type { Question } from '@/lib/quizData';
import { getAnswerIndex, shuffleArray } from '@/lib/quizData';
import { playCorrect, playWrong, playHint } from '@/lib/sounds';
import { addWrongAnswer } from '@/components/WrongAnswersReview';

interface QuizGameProps {
  questions: Question[];
  topicName: string;
  subjectId?: string;
  onComplete: (correct: number, total: number, streak: number, missedQuestions: { question: string; answer: string; selected: string }[]) => void;
  onExit: () => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

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

const QuizGame = ({ questions, topicName, subjectId, onComplete, onExit }: QuizGameProps) => {
  const [shuffledQuestions] = useState(() => shuffleArray(questions));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(() => shuffledQuestions.length);
  const [hiddenOptions, setHiddenOptions] = useState<Set<number>>(new Set());
  
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoAdvanceTime, setAutoAdvanceTime] = useState(2000);

  const question = shuffledQuestions[currentIndex];
  const correctOriginalIdx = getAnswerIndex(question.answer);
  const progress = ((currentIndex) / shuffledQuestions.length) * 100;

  const shuffledOptions = useMemo(() => shuffleOptions(question), [question]);
  const correctShuffledIdx = shuffledOptions.findIndex(o => o.originalIndex === correctOriginalIdx);

  const [missedList, setMissedList] = useState<{ question: string; answer: string; selected: string }[]>([]);

  const useHint = useCallback(() => {
    if (hintsLeft <= 0 || showResult || hiddenOptions.size > 0) return;
    const wrongIndices = shuffledOptions
      .map((_, idx) => idx)
      .filter(idx => idx !== correctShuffledIdx);
    for (let i = wrongIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wrongIndices[i], wrongIndices[j]] = [wrongIndices[j], wrongIndices[i]];
    }
    const toHide = new Set(wrongIndices.slice(0, 2));
    setHiddenOptions(toHide);
    setHintsLeft(h => h - 1);
  }, [hintsLeft, showResult, hiddenOptions.size, shuffledOptions, correctShuffledIdx]);

  const handleSelect = useCallback((idx: number) => {
    if (showResult || hiddenOptions.has(idx)) return;
    setSelected(idx);
    setShowResult(true);
    const isCorrect = idx >= 0 && idx === correctShuffledIdx;
    if (isCorrect) {
      playCorrect();
      setCorrect(c => c + 1);
      setStreak(s => s + 1);
    } else {
      playWrong();
      setStreak(0);
      const correctOpt = [question.option_a, question.option_b, question.option_c, question.option_d][correctOriginalIdx];
      const selectedOpt = idx >= 0 ? shuffledOptions[idx]?.text || 'No answer' : 'No answer';
      setMissedList(prev => [...prev, { question: question.question, answer: `${question.answer}. ${correctOpt}`, selected: selectedOpt }]);
      addWrongAnswer({
        question: question.question,
        correctAnswer: `${question.answer}. ${correctOpt}`,
        selectedAnswer: selectedOpt,
        topic: topicName,
      });
    }
  }, [showResult, hiddenOptions, correctShuffledIdx, question, correctOriginalIdx, shuffledOptions, topicName]);

  const isLastAnswerCorrect = selected !== null && selected === correctShuffledIdx;

  useEffect(() => {
    if (!showResult) return;
    if (isLastAnswerCorrect) {
      handleNext();
    } else {
      autoAdvanceRef.current = setTimeout(() => handleNext(), autoAdvanceTime || 2000);
    }
    return () => { if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current); };
  }, [showResult, autoAdvanceTime, isLastAnswerCorrect]);

  const handleNext = useCallback(() => {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    if (currentIndex + 1 >= shuffledQuestions.length) {
      onComplete(correct, shuffledQuestions.length, streak, missedList);
      return;
    }
    setCurrentIndex(i => i + 1);
    setSelected(null);
    setShowResult(false);
    setHiddenOptions(new Set());
  }, [currentIndex, shuffledQuestions.length, correct, onComplete, streak, missedList]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!showResult) {
        if (e.key >= '1' && e.key <= '4') handleSelect(parseInt(e.key) - 1);
        if (e.key === 'h' || e.key === 'H') useHint();
      } else {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNext(); }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showResult, handleSelect, handleNext, useHint]);

  return (
    <div className="w-full max-w-lg mx-auto lg:max-w-2xl flex flex-col min-h-[80vh] justify-center">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onExit} className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64" side="bottom" align="end">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">Wrong answer delay</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {autoAdvanceTime === 0 ? 'Instant' : `${(autoAdvanceTime / 1000).toFixed(1)}s`}
                  </span>
                </div>
                <Slider
                  value={[autoAdvanceTime]}
                  onValueChange={([v]) => setAutoAdvanceTime(v)}
                  min={0}
                  max={5000}
                  step={500}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Instant</span>
                  <span>5s</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Hint Button */}
          <button
            onClick={useHint}
            disabled={hintsLeft <= 0 || showResult || hiddenOptions.size > 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              hintsLeft > 0 && !showResult && hiddenOptions.size === 0
                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                : 'bg-muted text-muted-foreground/40 cursor-not-allowed'
            }`}
            title={`Hint: Remove 2 wrong options (${hintsLeft} left) — Press H`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{hintsLeft}</span>
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-2">
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-foreground"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground">
          <span>{currentIndex + 1} of {shuffledQuestions.length}</span>
          <span>{correct} correct</span>
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          className="space-y-6 my-6"
        >
          <p className="text-xl font-semibold text-foreground leading-relaxed text-center px-2">
            {question.question}
          </p>

          {/* Options */}
          <div className="space-y-2.5">
            {shuffledOptions.map((opt, idx) => {
              if (!opt.text) return null;
              const isSelected = selected === idx;
              const isCorrectOption = idx === correctShuffledIdx;
              const isHidden = hiddenOptions.has(idx);

              if (isHidden && !showResult) {
                return (
                  <motion.div
                    key={`${currentIndex}-${idx}`}
                    initial={{ opacity: 1, scale: 1 }}
                    animate={{ opacity: 0.3, scale: 0.97 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-xl p-4 w-full text-left flex items-center gap-3 bg-muted/20 border border-transparent cursor-not-allowed"
                  >
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 bg-background text-muted-foreground/30 border border-border/50">
                      {OPTION_LABELS[idx]}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground/30 flex-1 line-through">{opt.text}</span>
                  </motion.div>
                );
              }

              let stateClass = 'bg-muted/50 hover:bg-muted';
              if (showResult) {
                if (isCorrectOption) stateClass = 'option-correct';
                else if (isSelected) stateClass = 'option-wrong';
                else stateClass = 'bg-muted/30';
              }

              const SWIPE_THRESHOLD = 50;

              return (
                <motion.div
                  key={`${currentIndex}-${idx}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  drag={showResult ? false : true}
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  dragElastic={0.3}
                  onDragEnd={(_: any, info: PanInfo) => {
                    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD || Math.abs(info.offset.y) > SWIPE_THRESHOLD) {
                      handleSelect(idx);
                    }
                  }}
                  onClick={() => handleSelect(idx)}
                  style={{ touchAction: showResult ? 'auto' : 'none' }}
                  className={`rounded-xl p-4 w-full text-left flex items-center gap-3 transition-colors border border-transparent ${stateClass} ${
                    showResult ? 'cursor-default' : 'active:scale-[0.98] cursor-grab active:cursor-grabbing'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    showResult && isCorrectOption ? 'bg-success text-success-foreground'
                      : showResult && isSelected ? 'bg-destructive text-destructive-foreground'
                        : 'bg-background text-muted-foreground border border-border'
                  }`}>
                    {showResult && isCorrectOption ? <CheckCircle2 className="w-4 h-4" />
                      : showResult && isSelected ? <XCircle className="w-4 h-4" />
                        : OPTION_LABELS[idx]}
                  </span>
                  <span className="text-sm font-medium text-foreground flex-1">{opt.text}</span>
                  {!showResult && (
                    <>
                      <span className="hidden lg:inline text-[10px] text-muted-foreground/50 shrink-0 font-mono border border-border/50 rounded px-1.5 py-0.5">
                        {idx + 1}
                      </span>
                      <span className="lg:hidden text-[10px] text-muted-foreground/50 shrink-0">swipe →</span>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-1"
          >
            {selected === correctShuffledIdx ? (
              <p className="text-success font-semibold">Correct!</p>
            ) : (
              <p className="text-destructive font-semibold">Wrong — answer was {OPTION_LABELS[correctShuffledIdx]}</p>
            )}
            {question.notes && (
              <p className="text-xs text-muted-foreground italic">{question.notes}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizGame;
