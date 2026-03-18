export interface ThemeConfig {
  id: string;
  name: string;
  emoji: string;
  vars: Record<string, string>;
}

export const themes: ThemeConfig[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    emoji: '🖤',
    vars: {
      '--background': '0 0% 4%',
      '--foreground': '0 0% 95%',
      '--card': '0 0% 7%',
      '--card-foreground': '0 0% 95%',
      '--popover': '0 0% 7%',
      '--popover-foreground': '0 0% 95%',
      '--primary': '0 0% 100%',
      '--primary-foreground': '0 0% 0%',
      '--secondary': '0 0% 14%',
      '--secondary-foreground': '0 0% 90%',
      '--muted': '0 0% 10%',
      '--muted-foreground': '0 0% 55%',
      '--accent': '0 0% 14%',
      '--accent-foreground': '0 0% 90%',
      '--destructive': '0 62% 55%',
      '--destructive-foreground': '0 0% 100%',
      '--success': '142 50% 45%',
      '--success-foreground': '0 0% 100%',
      '--warning': '38 92% 55%',
      '--warning-foreground': '0 0% 0%',
      '--border': '0 0% 14%',
      '--input': '0 0% 14%',
      '--ring': '0 0% 100%',
    },
  },
  {
    id: 'snow',
    name: 'Snow',
    emoji: '⬜',
    vars: {
      '--background': '0 0% 98%',
      '--foreground': '0 0% 9%',
      '--card': '0 0% 100%',
      '--card-foreground': '0 0% 9%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '0 0% 9%',
      '--primary': '0 0% 9%',
      '--primary-foreground': '0 0% 98%',
      '--secondary': '0 0% 94%',
      '--secondary-foreground': '0 0% 20%',
      '--muted': '0 0% 94%',
      '--muted-foreground': '0 0% 45%',
      '--accent': '0 0% 94%',
      '--accent-foreground': '0 0% 15%',
      '--destructive': '0 60% 52%',
      '--destructive-foreground': '0 0% 100%',
      '--success': '142 50% 45%',
      '--success-foreground': '0 0% 100%',
      '--warning': '38 92% 55%',
      '--warning-foreground': '0 0% 9%',
      '--border': '0 0% 90%',
      '--input': '0 0% 90%',
      '--ring': '0 0% 9%',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    vars: {
      '--background': '220 20% 6%',
      '--foreground': '210 20% 92%',
      '--card': '220 18% 10%',
      '--card-foreground': '210 20% 92%',
      '--popover': '220 18% 10%',
      '--popover-foreground': '210 20% 92%',
      '--primary': '210 100% 60%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '220 15% 16%',
      '--secondary-foreground': '210 20% 85%',
      '--muted': '220 15% 13%',
      '--muted-foreground': '215 15% 50%',
      '--accent': '220 15% 16%',
      '--accent-foreground': '210 20% 85%',
      '--destructive': '0 62% 55%',
      '--destructive-foreground': '0 0% 100%',
      '--success': '152 55% 42%',
      '--success-foreground': '0 0% 100%',
      '--warning': '38 92% 55%',
      '--warning-foreground': '0 0% 0%',
      '--border': '220 15% 16%',
      '--input': '220 15% 16%',
      '--ring': '210 100% 60%',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    emoji: '🌿',
    vars: {
      '--background': '150 10% 6%',
      '--foreground': '140 10% 92%',
      '--card': '150 8% 10%',
      '--card-foreground': '140 10% 92%',
      '--popover': '150 8% 10%',
      '--popover-foreground': '140 10% 92%',
      '--primary': '152 55% 50%',
      '--primary-foreground': '0 0% 0%',
      '--secondary': '150 8% 16%',
      '--secondary-foreground': '140 10% 85%',
      '--muted': '150 6% 13%',
      '--muted-foreground': '145 8% 48%',
      '--accent': '150 8% 16%',
      '--accent-foreground': '140 10% 85%',
      '--destructive': '0 62% 55%',
      '--destructive-foreground': '0 0% 100%',
      '--success': '152 55% 45%',
      '--success-foreground': '0 0% 100%',
      '--warning': '38 92% 55%',
      '--warning-foreground': '0 0% 0%',
      '--border': '150 6% 16%',
      '--input': '150 6% 16%',
      '--ring': '152 55% 50%',
    },
  },
  {
    id: 'lavender',
    name: 'Lavender',
    emoji: '💜',
    vars: {
      '--background': '260 15% 6%',
      '--foreground': '250 15% 92%',
      '--card': '260 12% 10%',
      '--card-foreground': '250 15% 92%',
      '--popover': '260 12% 10%',
      '--popover-foreground': '250 15% 92%',
      '--primary': '260 60% 65%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '260 10% 16%',
      '--secondary-foreground': '250 15% 85%',
      '--muted': '260 8% 13%',
      '--muted-foreground': '255 10% 48%',
      '--accent': '260 10% 16%',
      '--accent-foreground': '250 15% 85%',
      '--destructive': '0 62% 55%',
      '--destructive-foreground': '0 0% 100%',
      '--success': '152 55% 42%',
      '--success-foreground': '0 0% 100%',
      '--warning': '38 92% 55%',
      '--warning-foreground': '0 0% 0%',
      '--border': '260 8% 16%',
      '--input': '260 8% 16%',
      '--ring': '260 60% 65%',
    },
  },
  {
    id: 'ember',
    name: 'Ember',
    emoji: '🔥',
    vars: {
      '--background': '15 10% 6%',
      '--foreground': '20 10% 92%',
      '--card': '15 8% 10%',
      '--card-foreground': '20 10% 92%',
      '--popover': '15 8% 10%',
      '--popover-foreground': '20 10% 92%',
      '--primary': '15 80% 55%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '15 8% 16%',
      '--secondary-foreground': '20 10% 85%',
      '--muted': '15 6% 13%',
      '--muted-foreground': '15 8% 48%',
      '--accent': '15 8% 16%',
      '--accent-foreground': '20 10% 85%',
      '--destructive': '0 62% 55%',
      '--destructive-foreground': '0 0% 100%',
      '--success': '152 55% 42%',
      '--success-foreground': '0 0% 100%',
      '--warning': '38 92% 55%',
      '--warning-foreground': '0 0% 0%',
      '--border': '15 6% 16%',
      '--input': '15 6% 16%',
      '--ring': '15 80% 55%',
    },
  },
];

export function getStoredThemeId(): string {
  return localStorage.getItem('app_theme') || 'midnight';
}

export function setStoredThemeId(id: string) {
  localStorage.setItem('app_theme', id);
}

export function applyTheme(themeId: string) {
  const theme = themes.find(t => t.id === themeId) || themes[0];
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  root.style.setProperty('--sidebar-background', theme.vars['--card']);
  root.style.setProperty('--sidebar-foreground', theme.vars['--foreground']);
  root.style.setProperty('--sidebar-primary', theme.vars['--primary']);
  root.style.setProperty('--sidebar-primary-foreground', theme.vars['--primary-foreground']);
  root.style.setProperty('--sidebar-accent', theme.vars['--muted']);
  root.style.setProperty('--sidebar-accent-foreground', theme.vars['--foreground']);
  root.style.setProperty('--sidebar-border', theme.vars['--border']);
  root.style.setProperty('--sidebar-ring', theme.vars['--ring']);
  setStoredThemeId(themeId);
}
