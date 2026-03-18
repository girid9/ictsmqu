import ictsm from '@/data/ictsm_theory_2nd_year.json';
import ictsmScraped from '@/data/ictsm_scraped_2nd_year.json';
import employability from '@/data/employability_skills_2nd_year.json';
import engineering from '@/data/engineering_drawing_2nd_year.json';
import wcs from '@/data/wcs_2nd_year.json';

export interface Question {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  answer: string;
  notes: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  topics: { name: string; questions: Question[] }[];
  color: string;
}

function parseSubject(
  id: string,
  name: string,
  icon: string,
  data: Record<string, Question[]>,
  color: string
): Subject {
  const topics = Object.entries(data).map(([topicName, questions]) => ({
    name: topicName,
    questions,
  }));
  return { id, name, icon, topics, color };
}

export const subjects: Subject[] = [
  parseSubject('ictsm', 'ICTSM Theory', 'Monitor', ictsm as Record<string, Question[]>, 'from-blue-500 to-purple-600'),
  parseSubject('employability', 'Employability Skills', 'Briefcase', employability as Record<string, Question[]>, 'from-emerald-500 to-teal-600'),
  parseSubject('engineering', 'Engineering Drawing', 'PenTool', engineering as Record<string, Question[]>, 'from-orange-500 to-red-600'),
  parseSubject('wcs', 'Workshop Calc & Science', 'Calculator', wcs as Record<string, Question[]>, 'from-pink-500 to-rose-600'),
  parseSubject('ictsm-scraped', 'ICTSM Scraped', 'Search', ictsmScraped as Record<string, Question[]>, 'from-cyan-500 to-blue-600'),
];

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getAnswerIndex(answer: string): number {
  const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
  return map[answer.toUpperCase()] ?? 0;
}

export interface UserStats {
  totalQuizzes: number;
  totalCorrect: number;
  totalQuestions: number;
  currentStreak: number;
  bestStreak: number;
}

const DEFAULT_STATS: UserStats = {
  totalQuizzes: 0,
  totalCorrect: 0,
  totalQuestions: 0,
  currentStreak: 0,
  bestStreak: 0,
};

export function getStats(): UserStats {
  const stats = localStorage.getItem('quiz_stats');
  return stats ? { ...DEFAULT_STATS, ...JSON.parse(stats) } : { ...DEFAULT_STATS };
}

export function saveStats(stats: UserStats) {
  localStorage.setItem('quiz_stats', JSON.stringify(stats));
}

export interface QuizHistoryEntry {
  topic: string;
  correct: number;
  total: number;
  xp: number;
  date: string;
}

export function getQuizHistory(): QuizHistoryEntry[] {
  const data = localStorage.getItem('quiz_history');
  return data ? JSON.parse(data) : [];
}

export function addQuizHistory(entry: Omit<QuizHistoryEntry, 'date'>) {
  const history = getQuizHistory();
  history.unshift({ ...entry, date: new Date().toISOString() });
  if (history.length > 50) history.length = 50;
  localStorage.setItem('quiz_history', JSON.stringify(history));
}

export function getCompletedTopics(): string[] {
  const data = localStorage.getItem('quiz_completed_topics');
  return data ? JSON.parse(data) : [];
}

export function markTopicCompleted(topicName: string) {
  const completed = getCompletedTopics();
  if (!completed.includes(topicName)) {
    completed.push(topicName);
    localStorage.setItem('quiz_completed_topics', JSON.stringify(completed));
  }
}
