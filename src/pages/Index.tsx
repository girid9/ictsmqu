import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SubjectCard from '@/components/SubjectCard';
import TopicSelector from '@/components/TopicSelector';
import QuizGame from '@/components/QuizGame';
import QuizResult from '@/components/QuizResult';
import FlashcardMode from '@/components/FlashcardMode';
import SpacedRepetition from '@/components/SpacedRepetition';
import WrongAnswersReview from '@/components/WrongAnswersReview';
import AuthPage from '@/components/AuthPage';
import { subjects, type Subject, type Question, shuffleArray, getStats, saveStats, getCompletedTopics, markTopicCompleted, addQuizHistory } from '@/lib/quizData';
import { syncScoreToCloud, saveMissedQuestion } from '@/lib/supabaseSync';
import { supabase } from '@/integrations/supabase/client';
import StatsDashboard from '@/components/StatsDashboard';
import { BookOpen, BarChart3, LogOut, AlertCircle, Brain, Menu, X } from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';
import { playMenuOpen, playMenuClose, playQuizStart } from '@/lib/sounds';

type View = 'home' | 'topics' | 'quiz' | 'result' | 'flashcards' | 'review' | 'wrong-answers' | 'auth';
type Tab = 'subjects' | 'stats';

const Index = () => {
  const [view, setView] = useState<View>('home');
  const [tab, setTab] = useState<Tab>('subjects');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [quizTopic, setQuizTopic] = useState('');
  const [currentTopicIndex, setCurrentTopicIndex] = useState<number | null>(null);
  const [result, setResult] = useState({ correct: 0, total: 0, missedQuestions: [] as { question: string; answer: string; selected: string }[] });
  const [statsVersion, setStatsVersion] = useState(0);
  const [playerName, setPlayerName] = useState<string | null>(() => localStorage.getItem('player_name'));
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSubjectSelect = useCallback((subject: Subject) => {
    setSelectedSubject(subject);
    setView('topics');
  }, []);

  const startQuiz = useCallback((questions: Question[], topicName: string) => {
    setQuizQuestions(questions);
    setQuizTopic(topicName);
    playQuizStart();
    setView('quiz');
  }, []);

  const startFlashcards = useCallback((questions: Question[], topicName: string) => {
    setQuizQuestions(questions);
    setQuizTopic(topicName);
    setView('flashcards');
  }, []);

  const handleTopicSelect = useCallback((topicIndex: number) => {
    if (!selectedSubject) return;
    const topic = selectedSubject.topics[topicIndex];
    setCurrentTopicIndex(topicIndex);
    startQuiz(topic.questions, topic.name);
  }, [selectedSubject, startQuiz]);

  const handleFlashcardSelect = useCallback((topicIndex: number) => {
    if (!selectedSubject) return;
    const topic = selectedSubject.topics[topicIndex];
    startFlashcards(topic.questions, topic.name);
  }, [selectedSubject, startFlashcards]);

  const handleAllTopics = useCallback(() => {
    if (!selectedSubject) return;
    const allQ = selectedSubject.topics.flatMap(t => t.questions);
    setCurrentTopicIndex(null);
    startQuiz(shuffleArray(allQ), `${selectedSubject.name} – All Topics`);
  }, [selectedSubject, startQuiz]);

  const handleComplete = useCallback(async (correct: number, total: number, quizStreak: number, missedQuestions: { question: string; answer: string; selected: string }[]) => {
    const s = getStats();
    s.totalQuizzes += 1;
    s.totalCorrect += correct;
    s.totalQuestions += total;
    if (correct === total) { s.currentStreak += 1; } else { s.currentStreak = 0; }
    if (s.currentStreak > s.bestStreak) { s.bestStreak = s.currentStreak; }
    saveStats(s);
    if (quizTopic) markTopicCompleted(quizTopic);
    addQuizHistory({ topic: quizTopic, correct, total, xp: 0 });
    await syncScoreToCloud(quizTopic, correct, total, 0);
    if (selectedSubject) {
      for (const missed of missedQuestions) {
        await saveMissedQuestion(selectedSubject.id, quizTopic, missed.question, missed.answer);
      }
    }
    setResult({ correct, total, missedQuestions });
    setStatsVersion(v => v + 1);
    setView('result');
  }, [quizTopic, selectedSubject]);

  const handleRetry = useCallback(() => { setView('quiz'); }, []);
  const handleHome = useCallback(() => { setView('home'); setSelectedSubject(null); setMenuOpen(false); }, []);

  // Next topic logic
  const nextTopicInfo = useMemo(() => {
    if (currentTopicIndex === null || !selectedSubject) return null;
    const nextIdx = currentTopicIndex + 1;
    if (nextIdx >= selectedSubject.topics.length) return null;
    return { index: nextIdx, name: selectedSubject.topics[nextIdx].name };
  }, [currentTopicIndex, selectedSubject]);

  const handleNextTopic = useCallback(() => {
    if (!nextTopicInfo || !selectedSubject) return;
    const topic = selectedSubject.topics[nextTopicInfo.index];
    setCurrentTopicIndex(nextTopicInfo.index);
    startQuiz(topic.questions, topic.name);
  }, [nextTopicInfo, selectedSubject, startQuiz]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('player_name');
    setPlayerName(null);
  };

  const navigateTo = (t: Tab) => {
    setTab(t);
    setMenuOpen(false);
  };

  const isHome = view === 'home';

  if (!playerName) {
    return <AuthPage onSuccess={(name) => setPlayerName(name)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ═══ TOP BAR ═══ */}
      {isHome && (
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-50 px-5 py-4 bg-card material-shadow-1"
        >
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-foreground tracking-tight">StudyApp</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Hello, {playerName}</p>
            </div>
            <button
              onClick={() => { const next = !menuOpen; next ? playMenuOpen() : playMenuClose(); setMenuOpen(next); }}
              className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground hover:bg-primary/10 transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </motion.header>
      )}

      {/* ═══ SLIDE-DOWN MENU ═══ */}
      <AnimatePresence>
        {menuOpen && isHome && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sticky top-[72px] z-40 bg-card material-shadow-2 overflow-hidden"
          >
            <div className="max-w-lg mx-auto px-5 py-3 space-y-1">
              {[
                { id: 'subjects' as Tab, label: 'Study', icon: BookOpen },
                { id: 'stats' as Tab, label: 'Statistics', icon: BarChart3 },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                    tab === item.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}

              <div className="border-t border-border my-2" />

              <ThemeSelector />

              <button
                onClick={() => { setView('wrong-answers'); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <AlertCircle className="w-5 h-5" />
                Wrong Answers
              </button>
              <button
                onClick={() => { setView('review'); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <Brain className="w-5 h-5" />
                Spaced Review
              </button>

              <div className="border-t border-border my-2" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className={`max-w-lg mx-auto px-5 ${isHome ? 'pt-5' : 'pt-4'}`}>
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {tab === 'subjects' && (
                <motion.div
                  key="tab-subjects"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 pb-8"
                >
                  <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Choose a Subject</h2>
                  <div className="space-y-3">
                    {subjects.map((subject, i) => (
                      <SubjectCard key={subject.id} subject={subject} index={i} onSelect={handleSubjectSelect} />
                    ))}
                  </div>
                </motion.div>
              )}

              {tab === 'stats' && (
                <motion.div key="tab-stats" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="pb-8">
                  <StatsDashboard />
                </motion.div>
              )}

            </motion.div>
          )}

          {view === 'topics' && selectedSubject && (
            <motion.div key="topics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-4 pb-8 max-w-2xl mx-auto">
              <TopicSelector topics={selectedSubject.topics} subjectName={selectedSubject.name} completedTopics={getCompletedTopics()} onSelectTopic={handleTopicSelect} onSelectAll={handleAllTopics} onBack={handleHome} onFlashcard={handleFlashcardSelect} />
            </motion.div>
          )}

          {view === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-2 pb-8 max-w-2xl mx-auto">
              <QuizGame key={Date.now()} questions={quizQuestions} topicName={quizTopic} subjectId={selectedSubject?.id} onComplete={handleComplete} onExit={() => setView('topics')} />
            </motion.div>
          )}

          {view === 'result' && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-8 pb-8">
              <QuizResult
                correct={result.correct}
                total={result.total}
                missedQuestions={result.missedQuestions}
                onRetry={handleRetry}
                onHome={handleHome}
                onNextTopic={nextTopicInfo ? handleNextTopic : undefined}
                nextTopicName={nextTopicInfo?.name}
              />
            </motion.div>
          )}

          {view === 'flashcards' && (
            <motion.div key="flashcards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-6 pb-8">
              <FlashcardMode questions={quizQuestions} topicName={quizTopic} onExit={() => setView('topics')} />
            </motion.div>
          )}

          {view === 'review' && (
            <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-6 pb-8">
              <SpacedRepetition onExit={handleHome} />
            </motion.div>
          )}

          {view === 'wrong-answers' && (
            <motion.div key="wrong-answers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-6 pb-8">
              <WrongAnswersReview onExit={handleHome} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
