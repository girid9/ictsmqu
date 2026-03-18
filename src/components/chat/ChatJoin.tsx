import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import pandaChat from '@/assets/panda-chat.png';

interface ChatJoinProps {
  playerName: string;
  onJoin: (roomCode: string) => void;
  onExit: () => void;
}

export default function ChatJoin({ playerName, onJoin, onExit }: ChatJoinProps) {
  const [code, setCode] = useState('');

  const handleConnect = () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length >= 2) {
      onJoin(trimmed);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-[80vh] flex flex-col items-center justify-center px-4"
    >
      <div className="w-full max-w-sm">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-card rounded-2xl p-6 material-shadow-2 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <img src={pandaChat} alt="Chat" className="w-8 h-8" />
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">Chat Room</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-6">
            Enter a room code to join. Anyone with the same code shares the room.
          </p>

          <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            Username
          </label>
          <div className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground mb-4">
            {playerName}
          </div>

          <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            Room Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
            placeholder="e.g. ROOM1"
            maxLength={20}
            className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 mb-1.5"
          />
          <p className="text-[10px] text-muted-foreground mb-5">
            Anyone who enters the same code will share this room
          </p>

          <button
            onClick={handleConnect}
            disabled={code.trim().length < 2}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
          >
            Connect
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
