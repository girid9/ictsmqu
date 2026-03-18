import { motion } from 'framer-motion';
import { ChevronRight, Shuffle, CheckCircle2, ArrowLeft, Layers, BookOpen } from 'lucide-react';
import { playTap, playNavigate } from '@/lib/sounds';

const TOPIC_EMOJIS: Record<string, string> = {
  'Linux Operating System': '🐧',
  'Printer and Scanner': '🖨️',
  'Networking': '🌐',
  'Windows & Linux Server Configuration': '⚙️',
  'Communication Skills': '💬',
  'Work Ethics': '🤝',
  'Entrepreneurship': '🚀',
  'Labour Welfare': '⚖️',
  'Orthographic Projection': '📐',
  'Isometric Projection': '📏',
  'Development of Surfaces': '🗺️',
  'Intersection of Solids': '🔷',
  'Algebra': '🧮',
  'Trigonometry': '📊',
  'Mensuration': '📐',
  'Heat': '🔥',
  'Electricity': '⚡',
};

function getEmoji(topicName: string): string {
  for (const [key, emoji] of Object.entries(TOPIC_EMOJIS)) {
    if (topicName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(topicName.toLowerCase())) {
      return emoji;
    }
  }
  return '📚';
}

interface TopicSelectorProps {
  topics: { name: string; questions: { question: string }[] }[];
  subjectName: string;
  completedTopics?: string[];
  onSelectTopic: (topicIndex: number) => void;
  onSelectAll: () => void;
  onBack: () => void;
  onFlashcard?: (topicIndex: number) => void;
}

const TopicSelector = ({ topics, subjectName, completedTopics = [], onSelectTopic, onSelectAll, onBack, onFlashcard }: TopicSelectorProps) => {
  const totalQuestions = topics.reduce((s, t) => s + t.questions.length, 0);
  const completedCount = topics.filter(t => completedTopics.includes(t.name)).length;
  const progressPercent = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-lg mx-auto space-y-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-card material-shadow-1 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-extrabold text-foreground truncate">{subjectName}</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-primary"
              />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">
              {completedCount}/{topics.length}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02, y: -2 }}
        onClick={() => { playNavigate(); onSelectAll(); }}
        className="relative overflow-hidden rounded-2xl p-4 bg-primary text-primary-foreground material-shadow-2 transition-all group w-full"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 opacity-100" />
        <div className="relative flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 180, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="w-9 h-9 rounded-xl bg-primary-foreground/20 flex items-center justify-center"
          >
            <Shuffle className="w-4.5 h-4.5" />
          </motion.div>
          <div className="text-left">
            <h3 className="font-bold text-sm">All Shuffled</h3>
            <p className="text-[11px] opacity-70 mt-0.5">{totalQuestions} questions</p>
          </div>
        </div>
      </motion.button>

      {/* Section Label */}
      <div className="flex items-center gap-2 pt-1">
        <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Topics</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Topic Cards Grid */}
      <div className="grid grid-cols-1 gap-2.5">
        {topics.map((topic, i) => {
          const completed = completedTopics.includes(topic.name);
          return (
            <motion.div
              key={topic.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 24 }}
              whileHover={{ x: 4 }}
            >
              <div
                className={`rounded-2xl bg-card material-shadow-1 overflow-hidden transition-all hover:material-shadow-2 ${
                  completed ? 'ring-2 ring-success/30' : ''
                }`}
              >
                <div className="flex items-stretch">
                  {/* Main clickable area */}
                  <button
                    onClick={() => { playTap(); onSelectTopic(i); }}
                    className="flex items-center gap-3.5 flex-1 min-w-0 p-4 hover:bg-muted/40 transition-colors text-left"
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                      completed ? 'bg-success/15' : 'bg-primary/10'
                    }`}>
                      {completed ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <span>{getEmoji(topic.name)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-foreground text-[13px] leading-snug line-clamp-2">{topic.name}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                        {topic.questions.length} questions
                        {completed && <span className="text-success ml-1.5">• Done</span>}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  </button>

                  {/* Flashcard button */}
                  {onFlashcard && (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onFlashcard(i)}
                      className="px-3.5 flex items-center justify-center border-l border-border text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                      title="Flashcards"
                    >
                      <Layers className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default TopicSelector;