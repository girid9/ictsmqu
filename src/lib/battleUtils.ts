import { supabase } from '@/integrations/supabase/client';
import { subjects, shuffleArray, type Question } from '@/lib/quizData';

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getQuestionsForBattle(subjectId: string, topicName: string, count = 10): Question[] {
  const subject = subjects.find(s => s.id === subjectId);
  if (!subject) return [];
  const topic = subject.topics.find(t => t.name === topicName);
  if (!topic) return [];
  return shuffleArray(topic.questions).slice(0, count);
}

export async function createBattleRoom(
  subjectId: string,
  topicName: string,
  hostDisplayName: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be signed in');

  const questions = getQuestionsForBattle(subjectId, topicName);
  if (questions.length === 0) throw new Error('No questions found');

  const roomCode = generateRoomCode();
  const questionIds = questions.map((_, i) => String(i));

  const { data, error } = await supabase
    .from('battle_rooms')
    .insert({
      room_code: roomCode,
      host_id: user.id,
      subject_id: subjectId,
      topic_name: topicName,
      question_ids: questionIds,
      host_display_name: hostDisplayName,
      status: 'waiting',
    })
    .select()
    .single();

  if (error) throw error;
  return { room: data, questions };
}

export async function joinBattleRoom(roomCode: string, guestDisplayName: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be signed in');

  // Find the room
  const { data: room, error: findError } = await supabase
    .from('battle_rooms')
    .select('*')
    .eq('room_code', roomCode.toUpperCase())
    .eq('status', 'waiting')
    .single();

  if (findError || !room) throw new Error('Room not found or already started');
  if (room.host_id === user.id) throw new Error('Cannot join your own room');

  // Join the room (don't change status - host will start)
  const { data, error } = await supabase
    .from('battle_rooms')
    .update({
      guest_id: user.id,
      guest_display_name: guestDisplayName,
    })
    .eq('id', room.id)
    .is('guest_id', null)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function submitBattleAnswer(
  roomId: string,
  questionIndex: number,
  selectedAnswer: string,
  isCorrect: boolean,
  isHost: boolean
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be signed in');

  // Insert answer
  await supabase
    .from('battle_answers')
    .insert({
      room_id: roomId,
      user_id: user.id,
      question_index: questionIndex,
      selected_answer: selectedAnswer,
      is_correct: isCorrect,
    });

  // Update score in room
  if (isCorrect) {
    const field = isHost ? 'host_score' : 'guest_score';
    const { data: room } = await supabase
      .from('battle_rooms')
      .select(field)
      .eq('id', roomId)
      .single();

    if (room) {
      await supabase
        .from('battle_rooms')
        .update({ [field]: (room as any)[field] + 1 })
        .eq('id', roomId);
    }
  }
}

export async function finishBattle(roomId: string) {
  await supabase
    .from('battle_rooms')
    .update({
      status: 'finished',
      finished_at: new Date().toISOString(),
    })
    .eq('id', roomId);
}
