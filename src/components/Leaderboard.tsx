import { motion } from 'framer-motion';
import { Target, BookOpen, TrendingUp, Trophy } from 'lucide-react';
import { getStats } from '@/lib/quizData';

const Leaderboard = () => {
  const stats = getStats();
  const accuracy = stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0;

  const statItems = [
    { icon: BookOpen, label: 'Quizzes Taken', value: stats.totalQuizzes.toString() },
    { icon: Target, label: 'Accuracy', value: `${accuracy}%` },
    { icon: TrendingUp, label: 'Best Streak', value: stats.bestStreak.toString() },
    { icon: Trophy, label: 'Questions Answered', value: stats.totalQuestions.toLocaleString() },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Your Stats</h2>

      {/* Stats grid */}
      <div className="space-y-2">
        {statItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
            <span className="text-sm font-bold text-foreground">{item.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
