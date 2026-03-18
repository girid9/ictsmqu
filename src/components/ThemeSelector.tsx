import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { themes, getStoredThemeId, applyTheme } from '@/lib/themes';
import { Palette, Check } from 'lucide-react';

interface ThemeSelectorProps {
  onClose?: () => void;
}

const ThemeSelector = ({ onClose }: ThemeSelectorProps) => {
  const [activeTheme, setActiveTheme] = useState(getStoredThemeId);
  const [open, setOpen] = useState(false);

  const handleSelect = (id: string) => {
    applyTheme(id);
    setActiveTheme(id);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-foreground hover:bg-muted transition-colors"
      >
        <Palette className="w-5 h-5" />
        Change Theme
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => { setOpen(false); onClose?.(); }}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-primary bg-primary/10 transition-colors"
      >
        <Palette className="w-5 h-5" />
        Change Theme
      </button>
      <div className="grid grid-cols-3 gap-1.5 px-2">
        {themes.map((theme) => {
          const isActive = activeTheme === theme.id;
          const primaryHsl = theme.vars['--primary'];
          const bgHsl = theme.vars['--background'];
          return (
            <button
              key={theme.id}
              onClick={() => handleSelect(theme.id)}
              className={`relative flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl text-[11px] font-bold transition-all border ${
                isActive
                  ? 'border-primary bg-primary/10'
                  : 'border-transparent bg-muted/50 hover:bg-muted'
              }`}
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden flex" style={{ background: `hsl(${bgHsl})` }}>
                <div className="w-1/2 h-full" style={{ background: `hsl(${bgHsl})` }} />
                <div className="w-1/2 h-full" style={{ background: `hsl(${primaryHsl})` }} />
              </div>
              <span className="truncate text-foreground w-full text-center">{theme.name}</span>
              {isActive && <Check className="w-3 h-3 text-primary absolute top-1 right-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelector;
