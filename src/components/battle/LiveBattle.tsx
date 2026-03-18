import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { type Question } from '@/lib/quizData';
import { Clock, User } from 'lucide-react';

interface LiveBattleProps {
  roomId: string;
  questions: Question[];
  isHost: boolean;
  playerName: string;
  opponentName: string;
  onComplete: (myScore: number, myAnswers: boolean[], oppScore: number, oppAnswers: boolean[]) => void;
}

const QUESTION_TIME = 20;

export default function LiveBattle({ roomId, questions, isHost, playerName, opponentName, onComplete }: LiveBattleProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timer, setTimer] = useState(QUESTION_TIME);
  const [myScore, setMyScore] = useState(0);
  const [myAnswers, setMyAnswers] = useState<boolean[]>([]);
  const [oppProgress, setOppProgress] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [oppAnswers, setOppAnswers] = useState<boolean[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [finished, setFinished] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const userId = useRef<string>('');
  const channelRef = useRef<any>(null);

  // Get user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) userId.current = user.id;
    });
  }, []);

  // Set room to active
  useEffect(() => {
    if (isHost) {
      supabase.from('battle_rooms').update({ status: 'active', started_at: new Date().toISOString() }).eq('id', roomId);
    }
  }, [roomId, isHost]);

  // Timer
  useEffect(() => {
    if (finished || showFeedback) return;
    if (timer <= 0) {
      handleAnswer(-1); // time up
      return;
    }
    const t = setTimeout(() => setTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, finished, showFeedback]);

  // Subscribe to opponent's answers
  useEffect(() => {
    const channel = supabase
      .channel(`battle-answers-${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'battle_answers',
        filter: `room_id=eq.${roomId}`,
      }, (payload) => {
        const answer = payload.new as any;
        if (answer.user_id !== userId.current) {
          setOppProgress(p => p + 1);
          setOppAnswers(prev => [...prev, answer.is_correct]);
          if (answer.is_correct) setOppScore(s => s + 1);
        }
      })
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  // Check if battle is over
  useEffect(() => {
    if (finished && oppProgress >= questions.length) {
      onComplete(myScore, myAnswers, oppScore, oppAnswers);
    }
  }, [finished, oppProgress, questions.length, myScore, myAnswers, oppScore, oppAnswers, onComplete]);

  // Wait timeout - if opponent doesn't finish in 30s after we finish
  useEffect(() => {
    if (!waiting) return;
    const t = setTimeout(() => {
      // Opponent disconnected, we win
      onComplete(myScore, myAnswers, oppScore, oppAnswers);
    }, 30000);
    return () => clearTimeout(t);
  }, [waiting, myScore, myAnswers, oppScore, oppAnswers, onComplete]);

  const handleAnswer = useCallback(async (optionIndex: number) => {
    if (selected !== null || finished) return;
    const q = questions[currentQ];
    const correctIdx = q.answer.charCodeAt(0) - 65; // A=0, B=1, etc.
    const isCorrect = optionIndex === correctIdx;
    const selectedText = optionIndex >= 0 ? [q.option_a, q.option_b, q.option_c, q.option_d][optionIndex] : 'TIMEOUT';

    setSelected(optionIndex);
    setShowFeedback(true);

    const newScore = isCorrect ? myScore + 1 : myScore;
    const newAnswers = [...myAnswers, isCorrect];
    setMyScore(newScore);
    setMyAnswers(newAnswers);

    // Submit to DB
    if (userId.current) {
      await supabase.from('battle_answers').insert({
        room_id: roomId,
        user_id: userId.current,
        question_index: currentQ,
        selected_answer: selectedText,
        is_correct: isCorrect,
      });

      // Update room score
      const field = isHost ? 'host_score' : 'guest_score';
      if (isCorrect) {
        await supabase.from('battle_rooms').update({ [field]: newScore }).eq('id', roomId);
      }
    }

    // Move to next question after delay
    setTimeout(() => {
      setShowFeedback(false);
      setSelected(null);
      if (currentQ + 1 >= questions.length) {
        setFinished(true);
        if (oppProgress >= questions.length) {
          onComplete(newScore, newAnswers, oppScore, oppAnswers);
        } else {
          setWaiting(true);
        }
      } else {
        setCurrentQ(c => c + 1);
        setTimer(QUESTION_TIME);
      }
    }, 1200);
  }, [selected, finished, questions, currentQ, myScore, myAnswers, roomId, isHost, oppProgress, oppScore, oppAnswers, onComplete]);

  if (waiting) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full mb-4" />
        <p className="text-foreground font-bold">Waiting for {opponentName}...</p>
        <p className="text-xs text-muted-foreground mt-1">Auto-win in 30s if they disconnect</p>
      </div>
    );
  }

  const q = questions[currentQ];
  const correctIdx = q.answer.charCodeAt(0) - 65;
  const options = [q.option_a, q.option_b, q.option_c, q.option_d];

  return (
    <div className="min-h-screen bg-background px-4 py-4 max-w-lg mx-auto">
      {/* Top Bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{playerName.charAt(0)}</span>
            </div>
            <span className="text-sm font-bold text-foreground">{myScore}</span>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-card border border-border text-xs font-bold text-foreground">
          {currentQ + 1}/{questions.length}
        </div>
        <div className="flex-1 flex justify-end">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">{oppScore}</span>
            <div className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center">
              <span className="text-xs font-bold text-destructive">{opponentName.charAt(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Opponent Progress */}
      <div className="flex items-center gap-2 mb-4 px-2">
        <User className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{opponentName}: Q{Math.min(oppProgress + 1, questions.length)}/{questions.length}</span>
        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
          <motion.div className="h-full bg-destructive/50 rounded-full" animate={{ width: `${(oppProgress / questions.length) * 100}%` }} />
        </div>
      </div>

      {/* Timer */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Clock className={`w-4 h-4 ${timer <= 5 ? 'text-destructive' : 'text-muted-foreground'}`} />
        <span className={`text-lg font-bold ${timer <= 5 ? 'text-destructive' : 'text-foreground'}`}>{timer}s</span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full bg-primary rounded-full"
          animate={{ width: `${((currentQ) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
          <div className="bg-card rounded-2xl p-5 border border-border mb-4 material-shadow-1">
            <p className="text-sm font-bold text-foreground leading-relaxed">{q.question}</p>
          </div>

          <div className="space-y-3">
            {options.map((opt, i) => {
              let cls = 'bg-card border-border hover:border-primary/30';
              if (showFeedback) {
                if (i === correctIdx) cls = 'option-correct border-success';
                else if (i === selected && i !== correctIdx) cls = 'option-wrong border-destructive';
              } else if (selected === i) {
                cls = 'bg-primary/10 border-primary';
              }
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleAnswer(i)}
                  disabled={showFeedback}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm font-semibold text-foreground transition-all active:scale-[0.98] ${cls}`}
                >
                  <span className="text-muted-foreground mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
