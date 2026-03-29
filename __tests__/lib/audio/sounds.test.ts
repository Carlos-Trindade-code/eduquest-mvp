import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock AudioContext before importing sounds module
const mockOscillator = {
  type: 'sine',
  frequency: { setValueAtTime: vi.fn() },
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
};

const mockGain = {
  gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
  connect: vi.fn(),
};

const mockAudioContext = {
  currentTime: 0,
  createOscillator: vi.fn(() => mockOscillator),
  createGain: vi.fn(() => mockGain),
  destination: {},
};

vi.stubGlobal('AudioContext', vi.fn(() => mockAudioContext));

describe('sounds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('isSoundMuted returns false by default', async () => {
    const { isSoundMuted } = await import('@/lib/audio/sounds');
    expect(isSoundMuted()).toBe(false);
  });

  it('toggleSoundMute toggles mute state', async () => {
    const { toggleSoundMute, isSoundMuted } = await import('@/lib/audio/sounds');
    expect(isSoundMuted()).toBe(false);
    toggleSoundMute();
    expect(localStorage.getItem('studdo_sound_muted')).toBe('true');
  });
});
