import { useState, useCallback, useMemo, useEffect } from 'react';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';
import SubjectCard from '@/components/SubjectCard';
import TopicSelector from '@/components/TopicSelector';
import QuizGame from '@/components/QuizGame';
import QuizResult from '@/components/QuizResult';
import FlashcardMode from '@/components/FlashcardMode';
import SpacedRepetition from '@/components/SpacedRepetition';
import WrongAnswersReview from '@/components/WrongAnswersReview';
import AuthPage from '@/components/AuthPage';
import Leaderboard from '@/components/Leaderboard';
import ChatMode from '@/components/chat/ChatMode';
import FloatingChatButton from '@/components/chat/FloatingChatButton';

import { subjects, type Subject, type Question, shuffleArray, getStats, saveStats, getCompletedTopics, markTopicCompleted, addQuizHistory } from '@/lib/quizData';
import { syncScoreToCloud, saveMissedQuestion } from '@/lib/supabaseSync';
import { supabase } from '@/integrations/supabase/client';
import StatsDashboard from '@/components/StatsDashboard';
import { BookOpen, BarChart3, LogOut, AlertCircle, Brain, Menu, X, Trophy, MessageSquare, Play } from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';
import KeyboardShortcutSettings from '@/components/KeyboardShortcutSettings';
import pandaChat from '@/assets/panda-chat.png';
import { playMenuOpen, playMenuClose, playQuizStart } from '@/lib/sounds';
import { loadQuizProgress, clearQuizProgress, type SavedQuizProgress } from '@/lib/quizProgress';

type View = 'home' | 'topics' | 'quiz' | 'result' | 'flashcards' | 'review' | 'wrong-answers' | 'auth' | 'chat';
type Tab = 'subjects' | 'stats' | 'leaderboard';

const pageTransition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };
const springTransition = { type: 'spring' as const, stiffness: 300, damping: 26 };

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
  const [chatVisible, setChatVisible] = useState<boolean>(() => {
    const saved = localStorage.getItem('chat_visible');
    return saved !== null ? saved === 'true' : true;
  });
  const [chatRoomCode, setChatRoomCode] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<SavedQuizProgress | null>(null);
  const [savedProgress, setSavedProgress] = useState<SavedQuizProgress | null>(null);

  useEffect(() => {
    setSavedProgress(loadQuizProgress());
  }, [view]);

  const toggleChatVisible = useCallback(() => {
    setChatVisible(prev => {
      const next = !prev;
      localStorage.setItem('chat_visible', String(next));
      return next;
    });
  }, []);

  const handleSubjectSelect = useCallback((subject: Subject) => {
    setSelectedSubject(subject);
    setView('topics');
  }, []);

  const startQuiz = useCallback((questions: Question[], topicName: string, resume?: SavedQuizProgress | null) => {
    setQuizQuestions(questions);
    setQuizTopic(topicName);
    setResumeData(resume ?? null);
    playQuizStart();
    setView('quiz');
  }, []);

  const handleResumeQuiz = useCallback(() => {
    const progress = loadQuizProgress();
    if (!progress) return;
    const subject = subjects.find(s => s.id === progress.subjectId);
    if (!subject) { clearQuizProgress(); return; }
    const topic = subject.topics.find(t => t.name === progress.topicName);
    const allQ = topic ? topic.questions : subject.topics.flatMap(t => t.questions);
    setSelectedSubject(subject);
    startQuiz(allQ, progress.topicName, progress);
  }, [startQuiz]);

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

  const handleRetry = useCallback(() => { setResumeData(null); setView('quiz'); }, []);
  const handleHome = useCallback(() => { setView('home'); setSelectedSubject(null); setMenuOpen(false); setChatRoomCode(null); setResumeData(null); }, []);

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

  const isHome = view === 'home';
  const showFloatingChat = view !== 'chat' && view !== 'auth' && chatVisible;

  if (!playerName) {
    return <AuthPage onSuccess={(name) => setPlayerName(name)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <FloatingChatButton onClick={() => setView('chat')} visible={showFloatingChat} />

      {/* ═══ TOP BAR ═══ */}
      {isHome && (
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springTransition}
          className="sticky top-0 z-50 px-5 py-4 bg-card/95 backdrop-blur-sm material-shadow-1"
        >
          <div className="max-w-lg lg:max-w-3xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-foreground tracking-tight">StudyApp</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Hello, {playerName}</p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => { const next = !menuOpen; next ? playMenuOpen() : playMenuClose(); setMenuOpen(next); }}
                className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-foreground hover:bg-primary/10 transition-all"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={menuOpen ? 'close' : 'menu'}
                    initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* ═══ TAB BAR ═══ */}
          <LayoutGroup>
            <div className="max-w-lg lg:max-w-3xl mx-auto mt-3 flex gap-1 bg-muted/50 rounded-xl p-1 relative">
              {[
                { id: 'subjects' as Tab, label: 'Study', icon: BookOpen },
                { id: 'stats' as Tab, label: 'Stats', icon: BarChart3 },
                { id: 'leaderboard' as Tab, label: 'Ranks', icon: Trophy },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold relative z-10 ${
                    tab === item.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === item.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-card rounded-lg material-shadow-1"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </LayoutGroup>
        </motion.header>
      )}

      {/* ═══ SLIDE-DOWN MENU ═══ */}
      <AnimatePresence>
        {menuOpen && isHome && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="sticky top-[140px] z-40 bg-card/95 backdrop-blur-sm material-shadow-2 overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.08, duration: 0.2 }}
              className="max-w-lg lg:max-w-3xl mx-auto px-5 py-3 space-y-1"
            >
              <ThemeSelector />

              <div className="hidden lg:block px-4 py-3">
                <KeyboardShortcutSettings />
              </div>

              <button
                onClick={toggleChatVisible}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="flex-1 text-left">Chat Panda</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  chatVisible ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'
                }`}>
                  {chatVisible ? 'Visible' : 'Hidden'}
                </span>
              </button>

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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className={`max-w-lg lg:max-w-3xl mx-auto px-5 ${isHome ? 'pt-5' : 'pt-4'}`}>
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={pageTransition}>
              <AnimatePresence mode="wait">
                {tab === 'subjects' && (
                  <motion.div key="tab-subjects" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={pageTransition} className="space-y-4 pb-8">
                    {savedProgress && (
                      <motion.div
                        initial={{ opacity: 0, y: -12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={springTransition}
                        className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-3"
                      >
                        <Play className="w-5 h-5 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{savedProgress.topicName}</p>
                          <p className="text-xs text-muted-foreground">Q{savedProgress.currentIndex + 1} · {savedProgress.correct} correct</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => { clearQuizProgress(); setSavedProgress(null); }} className="text-xs font-bold text-muted-foreground hover:text-destructive px-2 py-1.5 rounded-lg transition-colors">Dismiss</button>
                          <button onClick={handleResumeQuiz} className="text-xs font-bold text-primary-foreground bg-primary px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity active:scale-95">Resume</button>
                        </div>
                      </motion.div>
                    )}
                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Choose a Subject</h2>
                    <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                      {subjects.map((subject, i) => (
                        <SubjectCard key={subject.id} subject={subject} index={i} onSelect={handleSubjectSelect} />
                      ))}
                    </div>
                  </motion.div>
                )}

                {tab === 'stats' && (
                  <motion.div key="tab-stats" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={pageTransition} className="pb-8">
                    <StatsDashboard />
                  </motion.div>
                )}

                {tab === 'leaderboard' && (
                  <motion.div key="tab-leaderboard" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={pageTransition} className="pb-8">
                    <Leaderboard />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {view === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={pageTransition}>
              <ChatMode onExit={handleHome} playerName={playerName} initialRoomCode={chatRoomCode} />
            </motion.div>
          )}

          {view === 'topics' && selectedSubject && (
            <motion.div key="topics" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={pageTransition} className="pt-4 pb-8 max-w-2xl mx-auto">
              <TopicSelector topics={selectedSubject.topics} subjectName={selectedSubject.name} completedTopics={getCompletedTopics()} onSelectTopic={handleTopicSelect} onSelectAll={handleAllTopics} onBack={handleHome} onFlashcard={handleFlashcardSelect} />
            </motion.div>
          )}

          {view === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={pageTransition} className="pt-2 pb-8 max-w-2xl mx-auto">
              <QuizGame key={`${quizTopic}-${resumeData?.currentIndex ?? 'new'}`} questions={quizQuestions} topicName={quizTopic} subjectId={selectedSubject?.id} resumeData={resumeData} onComplete={handleComplete} onExit={() => setView('topics')} />
            </motion.div>
          )}

          {view === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }} className="pt-8 pb-8">
              <QuizResult correct={result.correct} total={result.total} missedQuestions={result.missedQuestions} onRetry={handleRetry} onHome={handleHome} onNextTopic={nextTopicInfo ? handleNextTopic : undefined} nextTopicName={nextTopicInfo?.name} />
            </motion.div>
          )}

          {view === 'flashcards' && (
            <motion.div key="flashcards" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={pageTransition} className="pt-6 pb-8">
              <FlashcardMode questions={quizQuestions} topicName={quizTopic} onExit={() => setView('topics')} />
            </motion.div>
          )}

          {view === 'review' && (
            <motion.div key="review" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={pageTransition} className="pt-6 pb-8">
              <SpacedRepetition onExit={handleHome} />
            </motion.div>
          )}

          {view === 'wrong-answers' && (
            <motion.div key="wrong-answers" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={pageTransition} className="pt-6 pb-8">
              <WrongAnswersReview onExit={handleHome} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;