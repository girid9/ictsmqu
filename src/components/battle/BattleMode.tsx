import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subjects, shuffleArray, type Question } from '@/lib/quizData';
import { generateRoomCode } from '@/lib/battleUtils';
import BattleLobby from './BattleLobby';
import MatchmakingScreen from './MatchmakingScreen';
import BattleCountdown from './BattleCountdown';
import LiveBattle from './LiveBattle';
import BattleResultScreen from './BattleResultScreen';

type Phase = 'lobby' | 'matchmaking' | 'countdown' | 'battle' | 'result';

interface BattleState {
  roomId: string;
  roomCode: string;
  isHost: boolean;
  questions: Question[];
  opponentName: string;
  isPrivate: boolean;
}

interface BattleModeProps {
  onExit: () => void;
  playerName: string;
}

export default function BattleMode({ onExit, playerName }: BattleModeProps) {
  const [phase, setPhase] = useState<Phase>('lobby');
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [draws, setDraws] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [playerAnswers, setPlayerAnswers] = useState<boolean[]>([]);
  const [opponentAnswers, setOpponentAnswers] = useState<boolean[]>([]);

  const loadProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
    if (!data) return;
    setWins((data as any).wins ?? 0);
    setLosses((data as any).losses ?? 0);
    setDraws((data as any).draws ?? 0);
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const getQuestionsForTopic = (subjectId: string, topicName: string, count = 10): Question[] => {
    if (subjectId === 'random' || topicName === 'Random Mix') {
      const all = subjects.flatMap(s => s.topics.flatMap(t => t.questions));
      return shuffleArray(all).slice(0, count);
    }
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return shuffleArray(subjects.flatMap(s => s.topics.flatMap(t => t.questions))).slice(0, count);
    const topic = subject.topics.find(t => t.name === topicName);
    if (!topic) return shuffleArray(subject.topics.flatMap(t => t.questions)).slice(0, count);
    return shuffleArray(topic.questions).slice(0, count);
  };

  const handleQuickMatch = async (subjectId: string, topicName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Look for existing room, prefer same topic
    const { data: matches } = await supabase
      .from('battle_rooms')
      .select('*')
      .eq('is_random_match', true)
      .eq('status', 'waiting')
      .is('guest_id', null)
      .neq('host_id', user.id)
      .order('created_at', { ascending: true })
      .limit(10);

    const sameTopicMatch = matches?.find(m => m.subject_id === subjectId && m.topic_name === topicName);
    const match = sameTopicMatch || matches?.[0];

    if (match) {
      const useSameTopic = sameTopicMatch != null;
      const questionsForBattle = useSameTopic
        ? getQuestionsForTopic(subjectId, topicName)
        : ((match as any).questions_data as any[] || []).map((q: any) => q as Question);

      const updateData: any = { guest_id: user.id, guest_display_name: playerName, status: 'ready' };
      if (useSameTopic) {
        updateData.questions_data = questionsForBattle;
        updateData.subject_id = subjectId;
        updateData.topic_name = topicName;
      }

      const { error: joinError } = await supabase
        .from('battle_rooms')
        .update(updateData)
        .eq('id', match.id)
        .is('guest_id', null);

      if (!joinError) {
        const { data: room } = await supabase
          .from('battle_rooms')
          .select('*')
          .eq('id', match.id)
          .single();

        if (room && room.guest_id === user.id) {
          const questions = ((room as any).questions_data as any[] || []).map((q: any) => q as Question);
          setBattle({
            roomId: room.id, roomCode: room.room_code, isHost: false,
            questions, opponentName: room.host_display_name, isPrivate: false,
          });
          setPhase('countdown');
          return;
        }
      }
    }

    // Create new room
    const questions = getQuestionsForTopic(subjectId, topicName);
    const roomCode = generateRoomCode();
    const { data: room } = await supabase
      .from('battle_rooms')
      .insert({
        room_code: roomCode, host_id: user.id, host_display_name: playerName,
        subject_id: subjectId, topic_name: topicName,
        question_ids: questions.map((_, i) => String(i)),
        questions_data: questions as any,
        is_random_match: true, status: 'waiting',
      } as any)
      .select()
      .single();

    if (!room) return;

    setBattle({
      roomId: room.id, roomCode: room.room_code, isHost: true,
      questions, opponentName: '', isPrivate: false,
    });
    setPhase('matchmaking');
  };

  const handleCreatePrivateRoom = async (subjectId: string, topicName: string): Promise<string | undefined> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const questions = getQuestionsForTopic(subjectId, topicName);
    const roomCode = generateRoomCode();

    const { data: room } = await supabase
      .from('battle_rooms')
      .insert({
        room_code: roomCode, host_id: user.id, host_display_name: playerName,
        subject_id: subjectId, topic_name: topicName,
        question_ids: questions.map((_, i) => String(i)),
        questions_data: questions as any,
        is_random_match: false, status: 'waiting',
      } as any)
      .select()
      .single();

    if (!room) return;

    setBattle({
      roomId: room.id, roomCode: room.room_code, isHost: true,
      questions, opponentName: '', isPrivate: true,
    });
    setPhase('matchmaking');
    return room.room_code;
  };

  const handleJoinPrivateRoom = async (code: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be signed in');

    const { data: room } = await supabase
      .from('battle_rooms')
      .select('*')
      .eq('room_code', code.toUpperCase())
      .eq('status', 'waiting')
      .is('guest_id', null)
      .single();

    if (!room) throw new Error('Room not found or already started');
    if (room.host_id === user.id) throw new Error('Cannot join your own room');

    const { error: joinError } = await supabase
      .from('battle_rooms')
      .update({ guest_id: user.id, guest_display_name: playerName, status: 'ready' })
      .eq('id', room.id)
      .is('guest_id', null);

    if (joinError) throw new Error('Room already taken');

    const { data: updated } = await supabase
      .from('battle_rooms')
      .select('*')
      .eq('id', room.id)
      .single();

    if (!updated || updated.guest_id !== user.id) throw new Error('Room already taken');

    const questions = ((updated as any).questions_data as any[] || []).map((q: any) => q as Question);
    setBattle({
      roomId: updated.id, roomCode: updated.room_code, isHost: false,
      questions, opponentName: updated.host_display_name, isPrivate: true,
    });
    setPhase('countdown');
  };

  const handleOpponentFound = useCallback((opponentName: string) => {
    if (battle) setBattle({ ...battle, opponentName });
    setPhase('countdown');
  }, [battle]);

  const handleCountdownComplete = useCallback(() => setPhase('battle'), []);

  const handleBattleComplete = useCallback(async (myScore: number, myAnswers: boolean[], oppScore: number, oppAnswers: boolean[]) => {
    setPlayerScore(myScore);
    setOpponentScore(oppScore);
    setPlayerAnswers(myAnswers);
    setOpponentAnswers(oppAnswers);

    if (!battle) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: freshProfile } = await supabase.from('profiles').select('wins, losses, draws').eq('user_id', user.id).single();
    if (!freshProfile) return;

    const currentWins = (freshProfile as any).wins ?? 0;
    const currentLosses = (freshProfile as any).losses ?? 0;
    const currentDraws = (freshProfile as any).draws ?? 0;

    if (myScore > oppScore) {
      await supabase.from('profiles').update({ wins: currentWins + 1 } as any).eq('user_id', user.id);
      setWins(currentWins + 1);
    } else if (myScore < oppScore) {
      await supabase.from('profiles').update({ losses: currentLosses + 1 } as any).eq('user_id', user.id);
      setLosses(currentLosses + 1);
    } else {
      await supabase.from('profiles').update({ draws: currentDraws + 1 } as any).eq('user_id', user.id);
      setDraws(currentDraws + 1);
    }

    if (battle.isHost) {
      await supabase.from('battle_rooms').update({ status: 'finished', finished_at: new Date().toISOString() }).eq('id', battle.roomId);
    }

    setPhase('result');
  }, [battle]);

  const handleCancel = useCallback(async () => {
    if (battle?.isHost) {
      await supabase.from('battle_rooms').delete().eq('id', battle.roomId);
    }
    setBattle(null);
    setPhase('lobby');
  }, [battle]);

  const handleBackToLobby = useCallback(() => {
    setBattle(null);
    setPlayerScore(0);
    setOpponentScore(0);
    setPlayerAnswers([]);
    setOpponentAnswers([]);
    setPhase('lobby');
    loadProfile();
  }, [loadProfile]);

  const handleRematch = useCallback(() => {
    handleBackToLobby();
  }, [handleBackToLobby]);

  switch (phase) {
    case 'lobby':
      return (
        <BattleLobby
          wins={wins} losses={losses} draws={draws}
          playerName={playerName}
          onQuickMatch={handleQuickMatch}
          onCreatePrivateRoom={handleCreatePrivateRoom}
          onJoinPrivateRoom={handleJoinPrivateRoom}
          onExit={onExit}
        />
      );
    case 'matchmaking':
      return (
        <MatchmakingScreen
          roomId={battle!.roomId} roomCode={battle!.roomCode}
          isPrivate={battle!.isPrivate}
          playerName={playerName}
          onOpponentFound={handleOpponentFound} onCancel={handleCancel}
        />
      );
    case 'countdown':
      return (
        <BattleCountdown
          playerName={playerName} opponentName={battle!.opponentName}
          onComplete={handleCountdownComplete}
        />
      );
    case 'battle':
      return (
        <LiveBattle
          roomId={battle!.roomId} questions={battle!.questions}
          isHost={battle!.isHost} playerName={playerName}
          opponentName={battle!.opponentName} onComplete={handleBattleComplete}
        />
      );
    case 'result':
      return (
        <BattleResultScreen
          playerName={playerName} opponentName={battle?.opponentName || 'Opponent'}
          playerScore={playerScore} opponentScore={opponentScore}
          playerAnswers={playerAnswers} opponentAnswers={opponentAnswers}
          onRematch={handleRematch} onHome={handleBackToLobby}
        />
      );
  }
}
