import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Skull, Handshake, Home, RotateCcw } from 'lucide-react';
import Confetti from '@/components/Confetti';

interface BattleResultScreenProps {
  playerName: string;
  opponentName: string;
  playerScore: number;
  opponentScore: number;
  playerAnswers: boolean[];
  opponentAnswers: boolean[];
  onRematch: () => void;
  onHome: () => void;
}

export default function BattleResultScreen({
  playerName, opponentName, playerScore, opponentScore,
  playerAnswers, opponentAnswers, onRematch, onHome,
}: BattleResultScreenProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const isWin = playerScore > opponentScore;
  const isDraw = playerScore === opponentScore;

  useEffect(() => {
    if (isWin) setShowConfetti(true);
  }, [isWin]);

  const handleShare = () => {
    const msg = isWin
      ? `I won a Quiz Battle ${playerScore}-${opponentScore}! 🏆`
      : isDraw
        ? `Draw in Quiz Battle ${playerScore}-${opponentScore}! 🤝`
        : `Lost a Quiz Battle ${playerScore}-${opponentScore}... next time! 💪`;
    if (navigator.share) {
      navigator.share({ text: msg }).catch(() => {});
    } else {
      navigator.clipboard.writeText(msg);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 max-w-lg mx-auto">
      {showConfetti && <Confetti />}

      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 12 }} className="text-center mb-8">
        {isWin ? (
          <>
            <Trophy className="w-16 h-16 text-primary mx-auto mb-3" />
            <h1 className="text-3xl font-black text-primary">YOU WIN!</h1>
          </>
        ) : isDraw ? (
          <>
            <Handshake className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
            <h1 className="text-3xl font-black text-foreground">DRAW!</h1>
          </>
        ) : (
          <>
            <Skull className="w-16 h-16 text-destructive mx-auto mb-3" />
            <h1 className="text-3xl font-black text-destructive">YOU LOST</h1>
          </>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl p-5 border border-border material-shadow-2 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-center flex-1">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1">
              <span className="text-lg font-bold text-primary">{playerName.charAt(0).toUpperCase()}</span>
            </div>
            <p className="text-xs font-bold text-foreground truncate">{playerName}</p>
            <p className="text-2xl font-black text-foreground mt-1">{playerScore}</p>
          </div>
          <div className="text-muted-foreground text-sm font-bold px-4">VS</div>
          <div className="text-center flex-1">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-1">
              <span className="text-lg font-bold text-destructive">{opponentName.charAt(0).toUpperCase()}</span>
            </div>
            <p className="text-xs font-bold text-foreground truncate">{opponentName}</p>
            <p className="text-2xl font-black text-foreground mt-1">{opponentScore}</p>
          </div>
        </div>

        <div className="border-t border-border pt-3">
          <p className="text-xs font-bold text-muted-foreground mb-2 uppercase">Question Breakdown</p>
          <div className="grid grid-cols-10 gap-1">
            {playerAnswers.map((correct, i) => (
              <div key={`p-${i}`} className={`h-6 rounded flex items-center justify-center text-[10px] font-bold ${correct ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                {correct ? '✓' : '✗'}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-10 gap-1 mt-1">
            {opponentAnswers.map((correct, i) => (
              <div key={`o-${i}`} className={`h-6 rounded flex items-center justify-center text-[10px] font-bold ${correct ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                {correct ? '✓' : '✗'}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">You</span>
            <span className="text-[10px] text-muted-foreground">{opponentName}</span>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-3">
        <button onClick={onRematch} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
          <RotateCcw className="w-4 h-4" /> Play Again
        </button>
        <button onClick={onHome} className="w-full py-3.5 rounded-xl bg-card border border-border text-foreground font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
          <Home className="w-4 h-4" /> Back to Lobby
        </button>
        <button onClick={handleShare} className="w-full py-3 rounded-xl text-muted-foreground text-sm font-semibold hover:text-foreground transition-colors">
          📤 Share Result
        </button>
      </motion.div>
    </div>
  );
}
