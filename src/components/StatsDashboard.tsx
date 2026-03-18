import { motion } from 'framer-motion';
import { Target, TrendingUp, Flame, Clock, BookOpen, Percent } from 'lucide-react';
import { getStats, getQuizHistory } from '@/lib/quizData';

const StatsDashboard = () => {
  const stats = getStats();
  const history = getQuizHistory().slice(0, 10);
  const accuracy = stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0;

  const statCards = [
    { icon: BookOpen, label: 'Quizzes', value: stats.totalQuizzes, color: 'bg-primary/10 text-primary' },
    { icon: Target, label: 'Correct', value: stats.totalCorrect, color: 'bg-success/10 text-success' },
    { icon: Percent, label: 'Accuracy', value: `${accuracy}%`, color: 'bg-accent/20 text-accent-foreground' },
    { icon: Flame, label: 'Best Streak', value: stats.bestStreak, color: 'bg-warning/15 text-warning-foreground' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06, type: 'spring', damping: 15 }}
            className="rounded-2xl p-4 bg-card border border-border material-shadow-1"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="w-4.5 h-4.5" />
            </div>
            <div className="text-2xl font-black text-foreground">{s.value}</div>
            <div className="text-[11px] text-muted-foreground font-medium mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Quiz History */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          Recent Quizzes
        </h3>

        {history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl py-16 text-center"
          >
            <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No quizzes yet</p>
            <p className="text-muted-foreground/60 text-xs mt-0.5">Start playing to see your history</p>
          </motion.div>
        ) : (
          <div className="space-y-1.5">
            {history.map((entry, i) => {
              const acc = Math.round((entry.correct / entry.total) * 100);
              return (
                <motion.div
                  key={`${entry.date}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-xl p-3.5 flex items-center gap-3 hover:bg-muted/40 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                    acc >= 80 ? 'bg-success/10 text-success'
                      : acc >= 50 ? 'bg-muted text-muted-foreground'
                        : 'bg-destructive/10 text-destructive'
                  }`}>
                    {acc}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{entry.topic}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground tabular-nums">{entry.correct}/{entry.total}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsDashboard;
