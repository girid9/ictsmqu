import { supabase } from '@/integrations/supabase/client';

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function syncScoreToCloud(topic: string, correct: number, total: number, xpEarned: number) {
  const session = await getSession();
  if (!session) return;

  // Insert quiz score
  await supabase.from('quiz_scores').insert({
    user_id: session.user.id,
    topic,
    correct,
    total,
    xp_earned: xpEarned,
  });

  // Update profile aggregates
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, total_quizzes, total_correct, total_questions, best_streak')
    .eq('user_id', session.user.id)
    .single();

  if (profile) {
    await supabase.from('profiles').update({
      xp: profile.xp + xpEarned,
      total_quizzes: profile.total_quizzes + 1,
      total_correct: profile.total_correct + correct,
      total_questions: profile.total_questions + total,
    }).eq('user_id', session.user.id);
  }
}

export async function getLeaderboard() {
  const { data } = await supabase
    .from('profiles')
    .select('display_name, xp, total_quizzes, total_correct, total_questions')
    .order('xp', { ascending: false })
    .limit(50);
  return data || [];
}

export async function saveMissedQuestion(
  subjectId: string,
  topicName: string,
  questionText: string,
  correctAnswer: string
) {
  const session = await getSession();
  if (!session) return;

  // Check if already exists
  const { data: existing } = await supabase
    .from('missed_questions')
    .select('id, times_missed')
    .eq('user_id', session.user.id)
    .eq('question_text', questionText)
    .single();

  if (existing) {
    // Increase interval: 1h, 4h, 1d, 3d, 7d
    const intervals = [1, 4, 24, 72, 168];
    const idx = Math.min(existing.times_missed, intervals.length - 1);
    const hoursUntilReview = intervals[idx];
    const nextReview = new Date(Date.now() + hoursUntilReview * 60 * 60 * 1000).toISOString();

    await supabase.from('missed_questions').update({
      times_missed: existing.times_missed + 1,
      next_review_at: nextReview,
      last_reviewed_at: new Date().toISOString(),
    }).eq('id', existing.id);
  } else {
    await supabase.from('missed_questions').insert({
      user_id: session.user.id,
      subject_id: subjectId,
      topic_name: topicName,
      question_text: questionText,
      correct_answer: correctAnswer,
      next_review_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });
  }
}

export async function getDueReviewQuestions() {
  const session = await getSession();
  if (!session) return [];

  const { data } = await supabase
    .from('missed_questions')
    .select('*')
    .eq('user_id', session.user.id)
    .lte('next_review_at', new Date().toISOString())
    .order('next_review_at', { ascending: true })
    .limit(20);

  return data || [];
}

export async function markQuestionReviewed(id: string) {
  const session = await getSession();
  if (!session) return;

  await supabase.from('missed_questions').update({
    last_reviewed_at: new Date().toISOString(),
    next_review_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }).eq('id', id);
}

export async function deleteReviewedQuestion(id: string) {
  await supabase.from('missed_questions').delete().eq('id', id);
}

export async function getCurrentProfile() {
  const session = await getSession();
  if (!session) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  return data;
}

export async function updateDisplayName(name: string) {
  const session = await getSession();
  if (!session) return;

  await supabase.from('profiles').update({ display_name: name }).eq('user_id', session.user.id);
}
