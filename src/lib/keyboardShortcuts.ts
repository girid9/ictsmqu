const STORAGE_KEY = 'quiz_keyboard_shortcuts';

export interface KeyboardShortcuts {
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  hint: string;
  next: string;
}

export const DEFAULT_SHORTCUTS: KeyboardShortcuts = {
  option1: '1',
  option2: '2',
  option3: '3',
  option4: '4',
  hint: 'h',
  next: 'Enter',
};

export function getShortcuts(): KeyboardShortcuts {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return { ...DEFAULT_SHORTCUTS };
  try {
    return { ...DEFAULT_SHORTCUTS, ...JSON.parse(data) };
  } catch {
    return { ...DEFAULT_SHORTCUTS };
  }
}

export function saveShortcuts(shortcuts: KeyboardShortcuts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts));
}

export function getDisplayKey(key: string): string {
  if (key === ' ') return '⎵';
  if (key === 'Enter') return '↵';
  if (key === 'ArrowUp') return '↑';
  if (key === 'ArrowDown') return '↓';
  if (key === 'ArrowLeft') return '←';
  if (key === 'ArrowRight') return '→';
  return key.toUpperCase();
}
