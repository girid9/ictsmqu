import { useState } from 'react';
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
      <div className="grid grid-cols-2 gap-2 px-2">
        {themes.map((theme) => {
          const isActive = activeTheme === theme.id;
          // Parse primary color for preview swatch
          const primaryHsl = theme.vars['--primary'];
          const bgHsl = theme.vars['--background'];
          const secondaryHsl = theme.vars['--secondary'];
          return (
            <button
              key={theme.id}
              onClick={() => handleSelect(theme.id)}
              className={`relative flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all border-2 ${
                isActive
                  ? 'border-primary bg-primary/10'
                  : 'border-transparent bg-muted/50 hover:bg-muted'
              }`}
            >
              <div className="flex gap-0.5 shrink-0">
                <div className="w-3 h-3 rounded-full" style={{ background: `hsl(${primaryHsl})` }} />
                <div className="w-3 h-3 rounded-full" style={{ background: `hsl(${secondaryHsl})` }} />
                <div className="w-3 h-3 rounded-full border border-current/20" style={{ background: `hsl(${bgHsl})` }} />
              </div>
              <span className="truncate text-foreground">{theme.emoji} {theme.name.replace(' (Default)', '')}</span>
              {isActive && <Check className="w-3.5 h-3.5 text-primary absolute top-1 right-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelector;
