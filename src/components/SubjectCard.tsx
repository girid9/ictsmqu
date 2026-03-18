import { motion } from 'framer-motion';
import { Monitor, Briefcase, PenTool, Calculator, BookOpen, ChevronRight } from 'lucide-react';
import type { Subject } from '@/lib/quizData';
import { playTap } from '@/lib/sounds';

const iconMap: Record<string, React.ElementType> = {
  Monitor, Briefcase, PenTool, Calculator,
};

interface SubjectCardProps {
  subject: Subject;
  index: number;
  onSelect: (subject: Subject) => void;
}

const SubjectCard = ({ subject, index, onSelect }: SubjectCardProps) => {
  const Icon = iconMap[subject.icon] || BookOpen;
  const totalQuestions = subject.topics.reduce((sum, t) => sum + t.questions.length, 0);

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 24 }}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={() => { playTap(); onSelect(subject); }}
      className="w-full flex items-center gap-4 p-4 rounded-xl bg-card border border-border material-shadow-1 hover:material-shadow-2 hover:border-primary/30 transition-all text-left group"
    >
      <motion.div
        whileHover={{ rotate: [0, -8, 8, 0] }}
        transition={{ duration: 0.4 }}
        className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors"
      >
        <Icon className="w-6 h-6 text-primary" />
      </motion.div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-foreground truncate">{subject.name}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {subject.topics.length} topics · {totalQuestions} questions
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
    </motion.button>
  );
};

export default SubjectCard;