import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Crown, Target, Users, Loader2 } from 'lucide-react';
import { getLeaderboard } from '@/lib/supabaseSync';

interface LeaderboardEntry {
  display_name: string;
  xp: number;
  total_quizzes: number;
  total_correct: number;
  total_questions: number;
}

const rankIcons = [Crown, Medal, Medal];
const rankColors = [
  'text-yellow-500 bg-yellow-500/10',
  'text-zinc-400 bg-zinc-400/10',
  'text-amber-600 bg-amber-600/10',
];

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then(data => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-20 space-y-3">
        <Users className="w-10 h-10 text-muted-foreground/30 mx-auto" />
        <p className="text-sm text-muted-foreground">No players yet</p>
        <p className="text-xs text-muted-foreground/60">Complete quizzes to appear on the leaderboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-primary" />
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Leaderboard</h2>
      </div>

      {/* Top 3 podium */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 mb-2">
          {[1, 0, 2].map((rank) => {
            const entry = entries[rank];
            if (!entry) return null;
            const RankIcon = rankIcons[rank];
            const isFirst = rank === 0;
            return (
              <motion.div
                key={rank}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rank * 0.1 }}
                className={`relative rounded-2xl p-4 text-center bg-card border border-border material-shadow-1 ${
                  isFirst ? 'ring-2 ring-primary/20 -mt-2' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-2 ${rankColors[rank]}`}>
                  <RankIcon className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-foreground truncate">{entry.display_name}</p>
                <p className="text-lg font-black text-primary mt-0.5">{entry.xp}</p>
                <p className="text-[10px] text-muted-foreground">XP</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Rest of the list */}
      <div className="space-y-1.5">
        {entries.map((entry, i) => {
          if (i < 3 && entries.length >= 3) return null;
          const accuracy = entry.total_questions > 0
            ? Math.round((entry.total_correct / entry.total_questions) * 100)
            : 0;

          return (
            <motion.div
              key={`${entry.display_name}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-muted/40 transition-colors"
            >
              <span className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{entry.display_name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {entry.total_quizzes} quizzes · {accuracy}% accuracy
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-foreground">{entry.xp}</p>
                <p className="text-[10px] text-muted-foreground">XP</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;
