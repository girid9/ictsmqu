export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_victory', name: 'First Victory', desc: 'Answer your first question correctly', icon: '🎯', unlocked: false },
  { id: 'hot_streak', name: 'Hot Streak', desc: 'Get 5 correct answers in a row', icon: '🔥', unlocked: false },
  { id: 'perfect_score', name: 'Perfect Score', desc: 'Get 10/10 in a quiz', icon: '⭐', unlocked: false },
  { id: 'speed_demon', name: 'Speed Demon', desc: 'Answer 5 questions in under 30 seconds total', icon: '⚡', unlocked: false },
  { id: 'topic_master', name: 'Topic Master', desc: 'Complete all topics in a subject', icon: '👨‍🎓', unlocked: false },
];

export function getAchievements(): Achievement[] {
  const data = localStorage.getItem('quiz_achievements');
  if (!data) return DEFAULT_ACHIEVEMENTS.map(a => ({ ...a }));
  const saved: Achievement[] = JSON.parse(data);
  // Merge with defaults in case new achievements are added
  return DEFAULT_ACHIEVEMENTS.map(def => {
    const found = saved.find(s => s.id === def.id);
    return found ? { ...def, unlocked: found.unlocked } : { ...def };
  });
}

export function saveAchievements(achievements: Achievement[]) {
  localStorage.setItem('quiz_achievements', JSON.stringify(achievements));
}

export function unlockAchievement(id: string): boolean {
  const achievements = getAchievements();
  const a = achievements.find(x => x.id === id);
  if (!a || a.unlocked) return false;
  a.unlocked = true;
  saveAchievements(achievements);
  return true;
}

export interface QuizResultData {
  correct: number;
  total: number;
  streak: number;
  totalTimeSeconds?: number;
}

/** Check all achievement conditions and return newly unlocked IDs */
export function checkAchievements(
  result: QuizResultData,
  completedTopicCount: number,
  totalTopicCount: number,
): string[] {
  const newlyUnlocked: string[] = [];

  // First Victory
  if (result.correct >= 1) {
    if (unlockAchievement('first_victory')) newlyUnlocked.push('first_victory');
  }

  // Hot Streak
  if (result.streak >= 5) {
    if (unlockAchievement('hot_streak')) newlyUnlocked.push('hot_streak');
  }

  // Perfect Score (at least 10 questions, all correct)
  if (result.correct === result.total && result.total >= 10) {
    if (unlockAchievement('perfect_score')) newlyUnlocked.push('perfect_score');
  }

  // Speed Demon
  if (result.totalTimeSeconds !== undefined && result.totalTimeSeconds <= 30 && result.correct >= 5) {
    if (unlockAchievement('speed_demon')) newlyUnlocked.push('speed_demon');
  }

  // Topic Master
  if (completedTopicCount >= totalTopicCount && totalTopicCount > 0) {
    if (unlockAchievement('topic_master')) newlyUnlocked.push('topic_master');
  }

  return newlyUnlocked;
}
