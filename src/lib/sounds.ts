// Web Audio API sound effects — no external dependencies
const audioCtx = () => {
  if (!(window as any).__quizAudioCtx) {
    (window as any).__quizAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return (window as any).__quizAudioCtx as AudioContext;
};

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.25) {
  try {
    const ctx = audioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // silent fail
  }
}

function playChord(frequencies: number[], duration: number, type: OscillatorType = 'sine', volume = 0.12) {
  frequencies.forEach(f => playTone(f, duration, type, volume));
}

// ── Quiz interactions ──

export function playCorrect() {
  playTone(523.25, 0.12, 'sine', 0.2);
  setTimeout(() => playTone(659.25, 0.12, 'sine', 0.2), 70);
  setTimeout(() => playTone(783.99, 0.18, 'sine', 0.22), 140);
}

export function playWrong() {
  playTone(311.13, 0.18, 'square', 0.12);
  setTimeout(() => playTone(277.18, 0.3, 'square', 0.12), 100);
}

export function playTimerWarning() {
  playTone(880, 0.1, 'sine', 0.1);
}

export function playTimerEnd() {
  playTone(220, 0.35, 'sawtooth', 0.1);
  setTimeout(() => playTone(196, 0.45, 'sawtooth', 0.1), 180);
}

// ── Navigation & UI ──

export function playTap() {
  playTone(600, 0.04, 'sine', 0.08);
}

export function playSwipe() {
  playTone(440, 0.06, 'sine', 0.07);
}

export function playNavigate() {
  playTone(880, 0.06, 'sine', 0.1);
  setTimeout(() => playTone(1100, 0.08, 'sine', 0.08), 50);
}

export function playMenuOpen() {
  playTone(500, 0.06, 'sine', 0.08);
  setTimeout(() => playTone(700, 0.06, 'sine', 0.08), 40);
  setTimeout(() => playTone(900, 0.06, 'sine', 0.06), 80);
}

export function playMenuClose() {
  playTone(900, 0.06, 'sine', 0.06);
  setTimeout(() => playTone(700, 0.06, 'sine', 0.06), 40);
  setTimeout(() => playTone(500, 0.06, 'sine', 0.06), 80);
}

// ── Results & achievements ──

export function playVictory() {
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.22, 'sine', 0.18), i * 90);
  });
}

export function playDefeat() {
  playTone(392, 0.22, 'sawtooth', 0.12);
  setTimeout(() => playTone(349.23, 0.32, 'sawtooth', 0.12), 180);
  setTimeout(() => playTone(293.66, 0.45, 'sawtooth', 0.12), 360);
}

export function playPerfectScore() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    setTimeout(() => playChord([freq, freq * 1.25], 0.25, 'sine', 0.12), i * 100);
  });
  setTimeout(() => playChord([1318.51, 1567.98], 0.4, 'sine', 0.15), 450);
}

export function playResultReveal() {
  playTone(440, 0.1, 'sine', 0.1);
  setTimeout(() => playTone(554.37, 0.1, 'sine', 0.1), 80);
  setTimeout(() => playTone(659.25, 0.15, 'sine', 0.12), 160);
}

// ── Social / Battle ──

export function playJoin() {
  playTone(659.25, 0.12, 'sine', 0.15);
  setTimeout(() => playTone(783.99, 0.18, 'sine', 0.15), 90);
}

export function playFlip() {
  playTone(350, 0.05, 'triangle', 0.1);
  setTimeout(() => playTone(700, 0.08, 'triangle', 0.08), 40);
}

export function playHint() {
  playTone(1200, 0.06, 'sine', 0.08);
  setTimeout(() => playTone(1400, 0.08, 'sine', 0.06), 60);
}

export function playQuizStart() {
  const notes = [440, 554.37, 659.25];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.12, 'sine', 0.15), i * 80);
  });
}
