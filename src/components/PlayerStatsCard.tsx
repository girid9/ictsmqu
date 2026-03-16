import { motion } from 'framer-motion';
import { Flame, TrendingUp, Target } from 'lucide-react';
import { getCurrentTier, getLevelProgress, getNextTierXP, getTierIndex } from '@/lib/leveling';

interface PlayerStatsCardProps {
  xp: number;
  streak: number;
  bestStreak: number;
  totalCorrect: number;
  totalQuestions: number;
}

const PlayerStatsCard = ({ xp, streak, bestStreak, totalCorrect, totalQuestions }: PlayerStatsCardProps) => {
  const tier = getCurrentTier(xp);
  const tierIndex = getTierIndex(xp);
  const progress = getLevelProgress(xp);
  const nextXP = getNextTierXP(xp);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl bg-card p-5 space-y-5 material-shadow-1 border border-border"
    >
      {/* Tier & XP */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
          {tier.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-foreground">{tier.name}</h3>
          <p className="text-sm text-primary font-semibold">{xp.toLocaleString()} XP</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground">Level</span>
          <p className="text-xl font-black text-foreground">{tierIndex + 1}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{Math.round(progress)}% complete</span>
          {tier.maxXP !== Infinity && (
            <span>{(nextXP - xp).toLocaleString()} XP to next</span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-muted/50 p-3 text-center">
          <Flame className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{streak}</p>
          <p className="text-[10px] text-muted-foreground">Streak</p>
        </div>
        <div className="rounded-xl bg-muted/50 p-3 text-center">
          <Target className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{accuracy}%</p>
          <p className="text-[10px] text-muted-foreground">Accuracy</p>
        </div>
        <div className="rounded-xl bg-muted/50 p-3 text-center">
          <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{bestStreak}</p>
          <p className="text-[10px] text-muted-foreground">Best</p>
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerStatsCard;
