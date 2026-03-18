const STORAGE_KEY = 'quiz_progress';

export interface SavedQuizProgress {
  subjectId: string;
  topicName: string;
  questionOrder: number[]; // indices into original questions array
  currentIndex: number;
  correct: number;
  streak: number;
  missedQuestions: { question: string; answer: string; selected: string }[];
  hintsLeft: number;
  savedAt: string;
}

export function saveQuizProgress(progress: SavedQuizProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function loadQuizProgress(): SavedQuizProgress | null {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  try {
    const parsed = JSON.parse(data) as SavedQuizProgress;
    // Expire after 24 hours
    const savedAt = new Date(parsed.savedAt).getTime();
    if (Date.now() - savedAt > 24 * 60 * 60 * 1000) {
      clearQuizProgress();
      return null;
    }
    return parsed;
  } catch {
    clearQuizProgress();
    return null;
  }
}

export function clearQuizProgress() {
  localStorage.removeItem(STORAGE_KEY);
}
