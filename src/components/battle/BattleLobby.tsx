import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Swords, Key, X, BookOpen, ChevronRight } from 'lucide-react';
import { subjects } from '@/lib/quizData';

interface BattleLobbyProps {
  wins: number;
  losses: number;
  draws: number;
  playerName: string;
  onQuickMatch: (subjectId: string, topicName: string) => void;
  onCreatePrivateRoom: (subjectId: string, topicName: string) => Promise<string | undefined>;
  onJoinPrivateRoom: (code: string) => Promise<void>;
  onExit: () => void;
}

export default function BattleLobby({
  wins, losses, draws, playerName,
  onQuickMatch, onCreatePrivateRoom, onJoinPrivateRoom, onExit,
}: BattleLobbyProps) {
  const [mode, setMode] = useState<'select' | 'pick-topic-quick' | 'pick-topic-private' | 'private-join'>('select');
  const [privateCode, setPrivateCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  const handleTopicConfirm = async () => {
    if (!selectedSubject || !selectedTopic) return;
    setLoading(true);
    setError('');
    try {
      if (mode === 'pick-topic-quick') {
        onQuickMatch(selectedSubject, selectedTopic);
      } else {
        await onCreatePrivateRoom(selectedSubject, selectedTopic);
      }
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleJoinRoom = async () => {
    if (privateCode.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      await onJoinPrivateRoom(privateCode);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const startTopicPick = (type: 'pick-topic-quick' | 'pick-topic-private') => {
    setSelectedSubject('');
    setSelectedTopic('');
    setError('');
    setMode(type);
  };

  const currentSubjectData = subjects.find(s => s.id === selectedSubject);
  const subjectEmoji = (icon: string) =>
    icon === 'Monitor' ? '💻' : icon === 'Briefcase' ? '💼' : icon === 'PenTool' ? '✏️' : icon === 'Calculator' ? '🔢' : '🔍';

  return (
    <div className="min-h-screen bg-background px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <button onClick={mode === 'select' ? onExit : () => { setMode('select'); setError(''); }} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-extrabold text-foreground">Quiz Battle</h1>
          <p className="text-xs text-muted-foreground">Challenge opponents in real-time</p>
        </div>
      </motion.div>

      {/* Player Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-4 mb-6 border border-border material-shadow-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
            {playerName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-bold text-foreground">{playerName}</p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p><span className="text-success font-bold">{wins}W</span> · <span className="text-destructive font-bold">{losses}L</span> · <span className="font-bold">{draws}D</span></p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {mode === 'select' && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Quick Match */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <button
                onClick={() => startTopicPick('pick-topic-quick')}
                className="w-full p-5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all active:scale-[0.98] mb-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Swords className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-base font-bold text-foreground">Quick Match</p>
                  <p className="text-xs text-muted-foreground">Find a random opponent</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </motion.div>

            {/* Private Room */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center gap-2 mb-3">
                <Key className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Private Room</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => startTopicPick('pick-topic-private')}
                  className="p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all active:scale-95"
                >
                  <p className="text-sm font-bold text-foreground">Create Room</p>
                  <p className="text-xs text-muted-foreground mt-1">Get a code to share</p>
                </button>
                <button
                  onClick={() => setMode('private-join')}
                  className="p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all active:scale-95"
                >
                  <p className="text-sm font-bold text-foreground">Join Room</p>
                  <p className="text-xs text-muted-foreground mt-1">Enter friend's code</p>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {(mode === 'pick-topic-quick' || mode === 'pick-topic-private') && (
          <motion.div key="pick-topic" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Choose Topic</h2>
            </div>

            {!selectedSubject ? (
              <div className="space-y-2">
                <button
                  onClick={() => { setSelectedSubject('random'); setSelectedTopic('Random Mix'); }}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all active:scale-[0.98]"
                >
                  <span className="text-2xl">🎲</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-foreground">Random Mix</p>
                    <p className="text-xs text-muted-foreground">Questions from all topics</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                {subjects.map(subject => (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject.id)}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all active:scale-[0.98]"
                  >
                    <span className="text-2xl">{subjectEmoji(subject.icon)}</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-foreground">{subject.name}</p>
                      <p className="text-xs text-muted-foreground">{subject.topics.length} topics</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            ) : selectedSubject === 'random' ? null : (
              <div className="space-y-2">
                <button onClick={() => setSelectedSubject('')} className="text-xs text-primary font-bold mb-2">← Back to subjects</button>
                {currentSubjectData?.topics.map(topic => (
                  <button
                    key={topic.name}
                    onClick={() => setSelectedTopic(topic.name)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-[0.98] ${selectedTopic === topic.name ? 'bg-primary/10 border-primary' : 'bg-card border-border hover:border-primary/30'}`}
                  >
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-foreground">{topic.name}</p>
                      <p className="text-xs text-muted-foreground">{topic.questions.length} questions</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedTopic && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                <div className="bg-primary/5 rounded-xl p-3 mb-3 border border-primary/20">
                  <p className="text-xs text-muted-foreground">Selected topic:</p>
                  <p className="text-sm font-bold text-foreground">{selectedTopic}</p>
                  {mode === 'pick-topic-quick' && (
                    <p className="text-[10px] text-muted-foreground mt-1">If opponent picks the same topic, you'll both get questions from it!</p>
                  )}
                </div>
                {error && <p className="text-xs text-destructive mb-2">{error}</p>}
                <button
                  onClick={handleTopicConfirm}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                  {loading ? 'Setting up...' : mode === 'pick-topic-quick' ? 'Find Match' : 'Create Room'}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {mode === 'private-join' && (
          <motion.div key="private-join" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Join Private Room</h3>
              <button onClick={() => { setMode('select'); setError(''); }} className="text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            <input
              value={privateCode}
              onChange={e => setPrivateCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-center text-lg font-bold tracking-[0.3em] placeholder:tracking-normal placeholder:text-sm mb-4"
            />
            {error && <p className="text-xs text-destructive mb-2">{error}</p>}
            <button
              onClick={handleJoinRoom}
              disabled={loading || privateCode.length !== 6}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Join Room'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
