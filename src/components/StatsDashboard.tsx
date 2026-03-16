import { motion } from 'framer-motion';
import { Target, TrendingUp, Flame, Clock, BookOpen } from 'lucide-react';
import { getStats, getQuizHistory } from '@/lib/quizData';

const StatsDashboard = () => {
  const stats = getStats();
  const history = getQuizHistory().slice(0, 10);

  const statCards = [
    { icon: Target, label: 'Correct', value: stats.totalCorrect },
    { icon: TrendingUp, label: 'Played', value: stats.totalQuestions },
    { icon: Flame, label: 'Best Streak', value: stats.bestStreak },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl p-5 text-center bg-muted/50"
          >
            <s.icon className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
            <div className="text-2xl font-black text-foreground">{s.value}</div>
            <div className="text-[11px] text-muted-foreground font-medium mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Quiz History */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4" />
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
              const accuracy = Math.round((entry.correct / entry.total) * 100);
              return (
                <motion.div
                  key={`${entry.date}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl p-4 flex items-center gap-3 hover:bg-muted/40 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                    accuracy >= 80 ? 'bg-success/10 text-success'
                      : accuracy >= 50 ? 'bg-muted text-muted-foreground'
                        : 'bg-destructive/10 text-destructive'
                  }`}>
                    {accuracy}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{entry.topic}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{entry.correct}/{entry.total}</span>
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
