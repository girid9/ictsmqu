import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

export interface WrongAnswer {
  question: string;
  correctAnswer: string;
  selectedAnswer: string;
  topic: string;
  date: string;
}

const STORAGE_KEY = 'quiz_wrong_answers';

export function getWrongAnswers(): WrongAnswer[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function addWrongAnswer(entry: Omit<WrongAnswer, 'date'>) {
  const list = getWrongAnswers();
  // Avoid duplicates by question text
  const exists = list.some(w => w.question === entry.question);
  if (!exists) {
    list.unshift({ ...entry, date: new Date().toISOString() });
    if (list.length > 200) list.length = 200;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

export function clearWrongAnswers() {
  localStorage.removeItem(STORAGE_KEY);
}

interface WrongAnswersReviewProps {
  onExit: () => void;
}

const WrongAnswersReview = ({ onExit }: WrongAnswersReviewProps) => {
  const [items, setItems] = useState<WrongAnswer[]>(getWrongAnswers);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleClear = () => {
    clearWrongAnswers();
    setItems([]);
  };

  const handleRemoveOne = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setItems(updated);
    if (expandedIndex === index) setExpandedIndex(null);
  };

  return (
    <div className="w-full max-w-lg mx-auto lg:max-w-2xl pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onExit} className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-black text-foreground">Wrong Answers</h2>
            <p className="text-xs text-muted-foreground">{items.length} question{items.length !== 1 ? 's' : ''} to review</p>
          </div>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 space-y-3"
        >
          <p className="text-4xl">🎉</p>
          <p className="text-foreground font-semibold">No wrong answers!</p>
          <p className="text-sm text-muted-foreground">Complete quizzes and any mistakes will show up here for review.</p>
        </motion.div>
      )}

      {/* Wrong answers list */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {items.map((item, i) => {
            const isExpanded = expandedIndex === i;
            return (
              <motion.div
                key={item.question + i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: i * 0.02 }}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : i)}
                  className="w-full text-left p-4 flex items-start gap-3"
                >
                  <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-relaxed line-clamp-2">
                      {item.question}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">{item.topic}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-2 border-t border-border pt-3 ml-7">
                        <div>
                          <p className="text-[10px] font-semibold text-destructive uppercase tracking-wider">Your Answer</p>
                          <p className="text-sm text-foreground mt-0.5">{item.selectedAnswer}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-success uppercase tracking-wider">Correct Answer</p>
                          <p className="text-sm text-foreground font-semibold mt-0.5">{item.correctAnswer}</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveOne(i); }}
                          className="text-[11px] text-muted-foreground hover:text-destructive transition-colors mt-1"
                        >
                          Remove from list
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WrongAnswersReview;
