import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Settings, Lightbulb, Flame, Eye } from 'lucide-react';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import type { Question } from '@/lib/quizData';
import { getAnswerIndex, shuffleArray } from '@/lib/quizData';
import { playCorrect, playWrong, playHint } from '@/lib/sounds';
import { addWrongAnswer } from '@/components/WrongAnswersReview';
import { saveQuizProgress, clearQuizProgress, type SavedQuizProgress } from '@/lib/quizProgress';
import { getShortcuts, getDisplayKey } from '@/lib/keyboardShortcuts';

interface QuizGameProps {
  questions: Question[];
  topicName: string;
  subjectId?: string;
  resumeData?: SavedQuizProgress | null;
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

/**
 * Estimate difficulty: longer question + longer options = harder.
 * Returns a numeric score (higher = harder).
 */
function estimateDifficulty(q: Question): number {
  const qLen = q.question.length;
  const optLen = (q.option_a?.length || 0) + (q.option_b?.length || 0) +
                 (q.option_c?.length || 0) + (q.option_d?.length || 0);
  return qLen + optLen * 0.5;
}

/**
 * Organize questions into sets of 3-4, ordered easy → hard within each set.
 * Each set has unique questions (no repeats across sets).
 * Sets themselves progress from easier to harder.
 */
function organizeIntoSets(qs: Question[]): Question[] {
  // Shuffle first to randomize within same-difficulty tiers
  const shuffled = shuffleArray(qs);
  // Sort by difficulty (easy first)
  const sorted = [...shuffled].sort((a, b) => estimateDifficulty(a) - estimateDifficulty(b));
  
  const SET_SIZE = 4;
  const result: Question[] = [];
  const used = new Set<string>();
  
  for (let i = 0; i < sorted.length; i++) {
    const q = sorted[i];
    const key = q.question;
    if (used.has(key)) continue;
    used.add(key);
    result.push(q);
  }
  
  // Within each set of 3-4, shuffle for variety but keep overall easy→hard progression
  const final: Question[] = [];
  for (let i = 0; i < result.length; i += SET_SIZE) {
    const set = result.slice(i, i + SET_SIZE);
    final.push(...shuffleArray(set));
  }
  
  return final;
}

const QuizGame = ({ questions, topicName, subjectId, resumeData, onComplete, onExit }: QuizGameProps) => {
  const [shuffledQuestions] = useState(() => {
    if (resumeData) {
      return resumeData.questionOrder.map(i => questions[i]);
    }
    return organizeIntoSets(questions);
  });
  const [currentIndex, setCurrentIndex] = useState(resumeData?.currentIndex ?? 0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correct, setCorrect] = useState(resumeData?.correct ?? 0);
  const [streak, setStreak] = useState(resumeData?.streak ?? 0);
  const [hintsLeft, setHintsLeft] = useState(resumeData?.hintsLeft ?? shuffledQuestions.length);
  const [hiddenOptions, setHiddenOptions] = useState<Set<number>>(new Set());
  const [revealedAnswer, setRevealedAnswer] = useState(false);
  
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoAdvanceTime, setAutoAdvanceTime] = useState(2000);

  const question = shuffledQuestions[currentIndex];
  const correctOriginalIdx = getAnswerIndex(question.answer);
  const progress = ((currentIndex) / shuffledQuestions.length) * 100;

  const shuffledOptions = useMemo(() => shuffleOptions(question), [question]);
  const correctShuffledIdx = shuffledOptions.findIndex(o => o.originalIndex === correctOriginalIdx);

  const [missedList, setMissedList] = useState<{ question: string; answer: string; selected: string }[]>(resumeData?.missedQuestions ?? []);

  // Save progress on each question change
  useEffect(() => {
    if (subjectId) {
      const questionOrder = shuffledQuestions.map(q => questions.indexOf(q));
      saveQuizProgress({
        subjectId,
        topicName,
        questionOrder,
        currentIndex,
        correct,
        streak,
        missedQuestions: missedList,
        hintsLeft,
        savedAt: new Date().toISOString(),
      });
    }
  }, [currentIndex, correct, streak, missedList, hintsLeft]);

  // Clear progress on complete
  const handleComplete = useCallback((c: number, t: number, s: number, m: { question: string; answer: string; selected: string }[]) => {
    clearQuizProgress();
    onComplete(c, t, s, m);
  }, [onComplete]);

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
    playHint();
  }, [hintsLeft, showResult, hiddenOptions.size, shuffledOptions, correctShuffledIdx]);

  const handleShowAnswer = useCallback(() => {
    if (showResult) return;
    setSelected(-1); // -1 means "revealed, not selected"
    setRevealedAnswer(true);
    setShowResult(true);
    setStreak(0);
    playHint();
    const correctOpt = [question.option_a, question.option_b, question.option_c, question.option_d][correctOriginalIdx];
    setMissedList(prev => [...prev, { question: question.question, answer: `${question.answer}. ${correctOpt}`, selected: 'Revealed' }]);
    addWrongAnswer({
      question: question.question,
      correctAnswer: `${question.answer}. ${correctOpt}`,
      selectedAnswer: 'Revealed (Show Answer)',
      topic: topicName,
    });
  }, [showResult, question, correctOriginalIdx, topicName]);

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

  const isLastAnswerCorrect = selected !== null && selected >= 0 && selected === correctShuffledIdx;

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
      handleComplete(correct, shuffledQuestions.length, streak, missedList);
      return;
    }
    setCurrentIndex(i => i + 1);
    setSelected(null);
    setShowResult(false);
    setHiddenOptions(new Set());
    setRevealedAnswer(false);
  }, [currentIndex, shuffledQuestions.length, correct, handleComplete, streak, missedList]);

  const shortcuts = useMemo(() => getShortcuts(), []);
  const optionKeys = useMemo(() => [shortcuts.option1, shortcuts.option2, shortcuts.option3, shortcuts.option4], [shortcuts]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (!showResult) {
        const optIdx = optionKeys.indexOf(key);
        if (optIdx !== -1) handleSelect(optIdx);
        if (key === shortcuts.hint) useHint();
        if (key === 's') handleShowAnswer();
      } else {
        if (key === shortcuts.next || e.key === ' ') { e.preventDefault(); handleNext(); }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showResult, handleSelect, handleNext, useHint, handleShowAnswer, shortcuts, optionKeys]);

  return (
    <div className="w-full max-w-lg mx-auto lg:max-w-2xl flex flex-col min-h-[80vh] justify-center">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onExit}
          className="w-10 h-10 rounded-xl bg-card border border-border material-shadow-1 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {/* Streak indicator */}
          {streak > 1 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-warning/15 text-warning-foreground"
            >
              <Flame className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">{streak}</span>
            </motion.div>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <button className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-95">
                <Settings className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 rounded-2xl material-shadow-2" side="bottom" align="end">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Wrong answer delay</span>
                  <span className="text-xs text-muted-foreground font-mono tabular-nums">
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

          {/* Show Answer Button */}
          <button
            onClick={handleShowAnswer}
            disabled={showResult}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              !showResult
                ? 'bg-warning/15 text-warning-foreground hover:bg-warning/25 border border-warning/20'
                : 'bg-muted text-muted-foreground/40 cursor-not-allowed border border-transparent'
            }`}
            title="Show the correct answer — Press S"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Show</span>
          </button>

          {/* Hint Button */}
          <button
            onClick={useHint}
            disabled={hintsLeft <= 0 || showResult || hiddenOptions.size > 0}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              hintsLeft > 0 && !showResult && hiddenOptions.size === 0
                ? 'bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20'
                : 'bg-muted text-muted-foreground/40 cursor-not-allowed border border-transparent'
            }`}
            title={`Hint: Remove 2 wrong options (${hintsLeft} left) — Press H`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{hintsLeft}</span>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[11px] font-medium text-muted-foreground">
          <span className="tabular-nums">{currentIndex + 1} of {shuffledQuestions.length}</span>
          <span className="tabular-nums text-primary font-bold">{correct} correct</span>
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="my-4"
        >
          {/* Question text */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-5 material-shadow-1">
            <p className="text-lg font-bold text-foreground leading-relaxed text-center">
              {question.question}
            </p>
          </div>

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
                    animate={{ opacity: 0.25, scale: 0.97 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-2xl p-4 w-full text-left flex items-center gap-3 bg-muted/10 border border-transparent cursor-not-allowed"
                  >
                    <span className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 bg-muted/30 text-muted-foreground/20">
                      {OPTION_LABELS[idx]}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground/20 flex-1 line-through">{opt.text}</span>
                  </motion.div>
                );
              }

              let containerClass = 'bg-card border-border hover:border-primary/30 hover:bg-primary/5';
              let labelClass = 'bg-muted text-muted-foreground';

              if (showResult) {
                if (isCorrectOption) {
                  containerClass = 'bg-success/8 border-success/40';
                  labelClass = 'bg-success text-success-foreground';
                } else if (isSelected) {
                  containerClass = 'bg-destructive/8 border-destructive/40';
                  labelClass = 'bg-destructive text-destructive-foreground';
                } else {
                  containerClass = 'bg-muted/20 border-border/50 opacity-50';
                  labelClass = 'bg-muted/50 text-muted-foreground/50';
                }
              }

              const SWIPE_THRESHOLD = 50;

              return (
                <motion.div
                  key={`${currentIndex}-${idx}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  drag={showResult ? false : true}
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  dragElastic={0.15}
                  onDragEnd={(_: any, info: PanInfo) => {
                    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD || Math.abs(info.offset.y) > SWIPE_THRESHOLD) {
                      handleSelect(idx);
                    }
                  }}
                  onClick={() => handleSelect(idx)}
                  whileTap={!showResult ? { scale: 0.98 } : undefined}
                  style={{ touchAction: showResult ? 'auto' : 'none' }}
                  className={`rounded-2xl p-4 w-full text-left flex items-center gap-3.5 transition-all duration-200 border material-shadow-1 ${containerClass} ${
                    showResult ? 'cursor-default' : 'cursor-pointer'
                  }`}
                >
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${labelClass}`}>
                    {showResult && isCorrectOption ? <CheckCircle2 className="w-4 h-4" />
                      : showResult && isSelected ? <XCircle className="w-4 h-4" />
                        : OPTION_LABELS[idx]}
                  </span>
                  <span className={`text-sm font-semibold flex-1 ${showResult && !isCorrectOption && !isSelected ? 'text-muted-foreground/50' : 'text-foreground'}`}>
                    {opt.text}
                  </span>
                  {!showResult && (
                    <span className="hidden lg:inline text-[10px] text-muted-foreground/40 shrink-0 font-mono bg-muted/50 rounded-md px-1.5 py-0.5">
                      {getDisplayKey(optionKeys[idx])}
                    </span>
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
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20 }}
            className={`text-center rounded-2xl p-4 mt-2 ${
              isLastAnswerCorrect
                ? 'bg-success/8 border border-success/20'
                : revealedAnswer
                  ? 'bg-warning/8 border border-warning/20'
                  : 'bg-destructive/8 border border-destructive/20'
            }`}
          >
            {isLastAnswerCorrect ? (
              <p className="text-success font-bold text-sm">✓ Correct!</p>
            ) : revealedAnswer ? (
              <p className="text-warning-foreground font-bold text-sm">👁 Answer: {OPTION_LABELS[correctShuffledIdx]}. {shuffledOptions[correctShuffledIdx]?.text}</p>
            ) : (
              <p className="text-destructive font-bold text-sm">✗ Wrong — answer was {OPTION_LABELS[correctShuffledIdx]}</p>
            )}
            {question.notes && (
              <p className="text-xs text-muted-foreground mt-1.5 italic leading-relaxed">{question.notes}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizGame;
