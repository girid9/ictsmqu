import { motion } from 'framer-motion';
import { Phone, PhoneOff } from 'lucide-react';
import pandaChat from '@/assets/panda-chat.png';

interface IncomingCallOverlayProps {
  callerName: string;
  onAccept: () => void;
  onDecline: () => void;
}

export default function IncomingCallOverlay({ callerName, onAccept, onDecline }: IncomingCallOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center gap-8"
    >
      {/* Pulsing avatar */}
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center"
      >
        <img src={pandaChat} alt="Caller" className="w-20 h-20" />
      </motion.div>

      <div className="text-center">
        <p className="text-lg font-bold text-foreground">{callerName}</p>
        <p className="text-sm text-muted-foreground mt-1">Incoming voice call…</p>
      </div>

      {/* Ring animation text */}
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-2xl"
      >
        📞 Ringing…
      </motion.p>

      {/* Accept / Decline */}
      <div className="flex items-center gap-12">
        <button
          onClick={onDecline}
          className="w-16 h-16 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center material-shadow-2 active:scale-90 transition-transform"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
        <motion.button
          onClick={onAccept}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center material-shadow-2 active:scale-90 transition-transform"
        >
          <Phone className="w-7 h-7" />
        </motion.button>
      </div>
    </motion.div>
  );
}
