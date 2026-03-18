import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { X, Share2 } from 'lucide-react';

interface MatchmakingScreenProps {
  roomId: string;
  roomCode: string;
  isPrivate: boolean;
  playerName: string;
  onOpponentFound: (opponentName: string) => void;
  onCancel: () => void;
}

export default function MatchmakingScreen({
  roomId, roomCode, isPrivate, playerName, onOpponentFound, onCancel,
}: MatchmakingScreenProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isPrivate && elapsed >= 60) onCancel();
  }, [elapsed, isPrivate, onCancel]);

  useEffect(() => {
    const channel = supabase
      .channel(`room-${roomId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'battle_rooms',
        filter: `id=eq.${roomId}`,
      }, (payload) => {
        const room = payload.new as any;
        if (room.guest_id && room.guest_display_name) {
          onOpponentFound(room.guest_display_name);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId, onOpponentFound]);

  const handleShare = () => {
    const msg = `Challenge me in Quiz Battle! 🎱\nCode: ${roomCode}\nJoin now!`;
    if (navigator.share) {
      navigator.share({ text: msg }).catch(() => {});
    } else {
      navigator.clipboard.writeText(msg);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div className="relative mb-8">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="absolute inset-0 w-32 h-32 rounded-full border-2 border-primary/30"
            style={{ left: '-16px', top: '-16px', width: '160px', height: '160px' }}
            animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
          />
        ))}
        <div className="w-32 h-32 rounded-full bg-card border-2 border-border flex items-center justify-center">
          <span className="text-4xl font-bold text-primary">{playerName.charAt(0).toUpperCase()}</span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center mb-6">
        <h2 className="text-lg font-bold text-foreground mb-1">
          {isPrivate ? 'Waiting for friend...' : 'Finding opponent...'}
        </h2>
        <p className="text-sm text-muted-foreground">{elapsed}s elapsed</p>
      </motion.div>

      {isPrivate && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl p-5 border border-border mb-6 text-center w-full max-w-xs">
          <p className="text-xs text-muted-foreground mb-2">Room Code</p>
          <p className="text-3xl font-extrabold text-foreground tracking-[0.3em] mb-3">{roomCode}</p>
          <button onClick={handleShare} className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors">
            <Share2 className="w-4 h-4" /> Share Code
          </button>
        </motion.div>
      )}

      {!isPrivate && elapsed >= 30 && (
        <p className="text-xs text-muted-foreground mb-4">Taking longer than usual...</p>
      )}

      <button onClick={onCancel} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground text-sm font-bold hover:bg-muted transition-colors">
        <X className="w-4 h-4" /> Cancel
      </button>
    </div>
  );
}
