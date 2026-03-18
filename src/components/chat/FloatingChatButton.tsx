import { motion, AnimatePresence } from 'framer-motion';
import pandaChat from '@/assets/panda-chat.png';

interface FloatingChatButtonProps {
  onClick: () => void;
  visible: boolean;
}

export default function FloatingChatButton({ onClick, visible }: FloatingChatButtonProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClick}
          className="fixed bottom-6 right-6 z-[100] w-16 h-16 rounded-full bg-primary material-shadow-3 flex items-center justify-center"
        >
          <img src={pandaChat} alt="Chat" className="w-11 h-11" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
