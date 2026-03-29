'use client';

// Tiny audio cues using Web Audio API — no external files needed
// Respects prefers-reduced-motion and user mute preference

const STORAGE_KEY = 'studdo_sound_muted';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  // Respect reduced motion
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return null;
  // Check user mute preference
  if (localStorage.getItem(STORAGE_KEY) === 'true') return null;

  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  const ctx = getAudioContext();
  if (!ctx) return;

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
}

// Upload success — cheerful ascending notes
export function playUploadSuccess() {
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(523, 0.12, 'sine', 0.12); // C5
  setTimeout(() => playTone(659, 0.12, 'sine', 0.12), 100); // E5
  setTimeout(() => playTone(784, 0.2, 'sine', 0.15), 200); // G5
}

// XP earned — quick happy ding
export function playXPEarned() {
  playTone(880, 0.15, 'sine', 0.1); // A5
  setTimeout(() => playTone(1047, 0.2, 'sine', 0.12), 80); // C6
}

// Button click — subtle tap
export function playButtonTap() {
  playTone(600, 0.05, 'sine', 0.06);
}

// Quiz correct answer — triumphant
export function playCorrectAnswer() {
  playTone(523, 0.1, 'triangle', 0.12);
  setTimeout(() => playTone(659, 0.1, 'triangle', 0.12), 80);
  setTimeout(() => playTone(784, 0.1, 'triangle', 0.12), 160);
  setTimeout(() => playTone(1047, 0.25, 'triangle', 0.15), 240);
}

// Quiz wrong answer — gentle descending
export function playWrongAnswer() {
  playTone(440, 0.15, 'sine', 0.08);
  setTimeout(() => playTone(349, 0.2, 'sine', 0.06), 120);
}

// Level up — celebratory fanfare
export function playLevelUp() {
  playTone(523, 0.1, 'square', 0.08);
  setTimeout(() => playTone(659, 0.1, 'square', 0.08), 100);
  setTimeout(() => playTone(784, 0.1, 'square', 0.08), 200);
  setTimeout(() => playTone(1047, 0.3, 'square', 0.1), 300);
  setTimeout(() => playTone(1319, 0.4, 'sine', 0.12), 450);
}

// Mute/unmute controls
export function isSoundMuted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function toggleSoundMute(): boolean {
  const newMuted = !isSoundMuted();
  localStorage.setItem(STORAGE_KEY, String(newMuted));
  return newMuted;
}
