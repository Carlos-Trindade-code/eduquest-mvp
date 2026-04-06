'use client';

// ============================================================
// TTS Provider abstraction
// Browser speechSynthesis (free) or Google Cloud TTS (natural)
// ============================================================

type TTSProvider = 'browser' | 'google';

function getProvider(): TTSProvider {
  // Google Cloud TTS requires server-side API call
  // If env var is set, frontend will call /api/tts endpoint
  if (typeof window !== 'undefined' && (window as any).__STUDDO_TTS_GOOGLE) return 'google';
  return 'browser';
}

function cleanTextForSpeech(text: string): string {
  return text
    .replace(/[*_#`~\[\]()>]/g, '')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ============================================================
// Browser TTS
// ============================================================
function speakWithBrowser(text: string, rate = 0.9, pitch = 1.1): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const clean = cleanTextForSpeech(text);
    if (!clean) { resolve(); return; }

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'pt-BR';
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Try to find a pt-BR voice
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith('pt-BR'))
      || voices.find(v => v.lang.startsWith('pt'));
    if (ptVoice) utterance.voice = ptVoice;

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

// ============================================================
// Google Cloud TTS (calls /api/tts server endpoint)
// ============================================================
async function speakWithGoogle(text: string): Promise<void> {
  const clean = cleanTextForSpeech(text);
  if (!clean) return;

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: clean }),
    });

    if (!res.ok) {
      // Fallback to browser TTS
      await speakWithBrowser(text);
      return;
    }

    const audioBlob = await res.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    await new Promise<void>((resolve) => {
      audio.onended = () => { URL.revokeObjectURL(audioUrl); resolve(); };
      audio.onerror = () => { URL.revokeObjectURL(audioUrl); resolve(); };
      audio.play().catch(() => resolve());
    });
  } catch {
    // Fallback to browser TTS
    await speakWithBrowser(text);
  }
}

// ============================================================
// Public API
// ============================================================
export function hasTTSSupport(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  return window.speechSynthesis.speaking;
}

export async function speak(text: string): Promise<void> {
  const provider = getProvider();
  if (provider === 'google') {
    await speakWithGoogle(text);
  } else {
    await speakWithBrowser(text);
  }
}
