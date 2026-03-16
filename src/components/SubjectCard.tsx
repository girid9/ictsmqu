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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => { playTap(); onSelect(subject); }}
      className="w-full flex items-center gap-4 p-4 rounded-xl bg-card border border-border material-shadow-1 hover:material-shadow-2 hover:border-primary/30 transition-all duration-200 text-left group"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-foreground truncate">{subject.name}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {subject.topics.length} topics · {totalQuestions} questions
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors flex-shrink-0" />
    </motion.button>
  );
};

export default SubjectCard;
