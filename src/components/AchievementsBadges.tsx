import { motion } from 'framer-motion';
import type { Achievement } from '@/lib/achievements';
import { Lock } from 'lucide-react';

interface AchievementsBadgesProps {
  achievements: Achievement[];
}

const AchievementsBadges = ({ achievements }: AchievementsBadgesProps) => {
  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-muted-foreground font-medium">
          {unlocked.length} of {achievements.length} unlocked
        </p>
      </div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <div className="space-y-2">
          {unlocked.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 rounded-xl p-4 bg-muted/50"
            >
              <span className="text-3xl">{a.icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground">{a.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Locked</h3>
          {locked.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.04 }}
              className="flex items-center gap-4 rounded-xl p-4 opacity-40"
            >
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <Lock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground">{a.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AchievementsBadges;
