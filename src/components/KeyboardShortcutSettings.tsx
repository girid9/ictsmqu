import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Keyboard, RotateCcw } from 'lucide-react';
import { getShortcuts, saveShortcuts, DEFAULT_SHORTCUTS, getDisplayKey, type KeyboardShortcuts } from '@/lib/keyboardShortcuts';

const LABELS: { key: keyof KeyboardShortcuts; label: string }[] = [
  { key: 'option1', label: 'Option A' },
  { key: 'option2', label: 'Option B' },
  { key: 'option3', label: 'Option C' },
  { key: 'option4', label: 'Option D' },
  { key: 'hint', label: 'Use Hint' },
  { key: 'next', label: 'Next / Skip' },
];

export default function KeyboardShortcutSettings() {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcuts>(getShortcuts);
  const [listening, setListening] = useState<keyof KeyboardShortcuts | null>(null);
  const listenerRef = useRef<((e: KeyboardEvent) => void) | null>(null);

  useEffect(() => {
    if (!listening) return;
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const key = e.key === ' ' ? ' ' : e.key.length === 1 ? e.key.toLowerCase() : e.key;
      setShortcuts(prev => {
        const updated = { ...prev, [listening]: key };
        saveShortcuts(updated);
        return updated;
      });
      setListening(null);
    };
    window.addEventListener('keydown', handler, true);
    listenerRef.current = handler;
    return () => window.removeEventListener('keydown', handler, true);
  }, [listening]);

  const resetDefaults = () => {
    setShortcuts({ ...DEFAULT_SHORTCUTS });
    saveShortcuts(DEFAULT_SHORTCUTS);
    setListening(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">Keyboard Shortcuts</span>
        </div>
        <button
          onClick={resetDefaults}
          className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {LABELS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setListening(listening === key ? null : key)}
            className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
              listening === key
                ? 'border-primary bg-primary/10 text-primary animate-pulse'
                : 'border-border bg-card text-foreground hover:border-primary/30'
            }`}
          >
            <span className="truncate">{label}</span>
            <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded-md shrink-0 ml-2 ${
              listening === key
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground'
            }`}>
              {listening === key ? '...' : getDisplayKey(shortcuts[key])}
            </span>
          </button>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Click a shortcut, then press any key to reassign
      </p>
    </div>
  );
}
