import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Brain, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { getDueReviewQuestions, markQuestionReviewed, deleteReviewedQuestion } from '@/lib/supabaseSync';
import { playCorrect, playWrong } from '@/lib/sounds';

interface ReviewQuestion {
  id: string;
  question_text: string;
  correct_answer: string;
  topic_name: string;
  times_missed: number;
}

interface SpacedRepetitionProps {
  onExit: () => void;
}

const SpacedRepetition = ({ onExit }: SpacedRepetitionProps) => {
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewed, setReviewed] = useState(0);

  useEffect(() => {
    getDueReviewQuestions().then((data) => {
      setQuestions(data as ReviewQuestion[]);
      setLoading(false);
    });
  }, []);

  const current = questions[currentIndex];

  const handleKnowIt = useCallback(async () => {
    if (!current) return;
    playCorrect();
    await deleteReviewedQuestion(current.id);
    setReviewed(r => r + 1);
    advance();
  }, [current, currentIndex, questions]);

  const handleStillLearning = useCallback(async () => {
    if (!current) return;
    playWrong();
    await markQuestionReviewed(current.id);
    setReviewed(r => r + 1);
    advance();
  }, [current, currentIndex, questions]);

  const advance = () => {
    setShowAnswer(false);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(i => i + 1);
    } else {
      setQuestions([]);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-lg mx-auto flex flex-col min-h-[60vh] justify-center items-center">
        <RefreshCw className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (questions.length === 0 || !current) {
    return (
      <div className="w-full max-w-lg mx-auto flex flex-col min-h-[60vh] justify-center items-center text-center px-5">
        <Brain className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">
          {reviewed > 0 ? 'All caught up!' : 'No reviews due'}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {reviewed > 0
            ? `You reviewed ${reviewed} question${reviewed > 1 ? 's' : ''}. Great work!`
            : 'Missed questions will appear here for review at spaced intervals.'}
        </p>
        <button
          onClick={onExit}
          className="px-6 py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col min-h-[80vh] justify-center">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onExit} className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Spaced Review</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{current.topic_name}</p>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {currentIndex + 1}/{questions.length}
        </span>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="bg-muted/30 border border-border rounded-2xl p-8 min-h-[280px] flex flex-col justify-center"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              Missed {current.times_missed}×
            </span>
          </div>

          <p className="text-lg font-semibold text-foreground leading-relaxed text-center mb-6">
            {current.question_text}
          </p>

          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="mx-auto px-6 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Show Answer
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Correct Answer</p>
                <p className="text-xl font-bold text-foreground">{current.correct_answer}</p>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleStillLearning}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Still Learning
                </button>
                <button
                  onClick={handleKnowIt}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Got It!
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SpacedRepetition;
