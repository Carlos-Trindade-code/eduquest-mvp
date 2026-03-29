"use client";
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Pause, Play, VolumeX, Volume2, X } from 'lucide-react';

const playlist = [
  { title: 'Lofi para Estudo', url: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&loop=1&playlist=jfKfPfyJRdk' },
  { title: 'Frequência Alfa', url: 'https://www.youtube.com/embed/1HzlFQwQK2c?autoplay=1&loop=1&playlist=1HzlFQwQK2c' },
];

export function MusicPlayer() {
  const [asked, setAsked] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const wasAsked = localStorage.getItem('musicAsked');
    const wasEnabled = localStorage.getItem('musicEnabled');
    if (wasAsked) {
      setAsked(true);
      if (wasEnabled === 'true') {
        setEnabled(true);
        setPlaying(true);
      }
    } else {
      // Mostra o toast após 3s na página
      const t = setTimeout(() => setShowToast(true), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem('musicAsked', 'true');
    localStorage.setItem('musicEnabled', 'true');
    setAsked(true);
    setEnabled(true);
    setPlaying(true);
    setShowToast(false);
  }

  function handleDecline() {
    localStorage.setItem('musicAsked', 'true');
    localStorage.setItem('musicEnabled', 'false');
    setAsked(true);
    setShowToast(false);
  }

  function togglePlay() {
    setPlaying(p => !p);
  }

  if (!enabled && asked) return null;

  const src = `${playlist[current].url}&mute=${muted ? 1 : 0}`;

  return (
    <>
      {/* Toast de permissão */}
      <AnimatePresence>
        {showToast && !asked && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-6 z-50 bg-[#1a1a2e] border border-purple-500/30 rounded-2xl px-5 py-4 shadow-2xl flex flex-col gap-3 max-w-xs"
          >
            <div className="flex items-center gap-2">
              <Music size={16} className="text-purple-400 shrink-0" />
              <p className="text-white text-sm font-medium">Quer ouvir música ambiente enquanto navega?</p>
              <button aria-label="Fechar" onClick={handleDecline} className="ml-auto text-white/30 hover:text-white">
                <X size={14} />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDecline}
                className="flex-1 py-1.5 rounded-lg text-white/50 hover:text-white text-xs border border-white/10 hover:border-white/20 transition-colors"
              >
                Não, obrigado
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors"
              >
                Sim, ligar 🎵
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini-player flutuante (só aparece se aceitou) */}
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-6 z-50 bg-[#1a1a2e] border border-purple-500/20 rounded-2xl px-4 py-2.5 shadow-xl flex items-center gap-3"
          >
            {/* iframe escondido — só áudio */}
            {playing && (
              <iframe
                ref={iframeRef}
                src={src}
                title="música ambiente"
                allow="autoplay"
                style={{ width: 0, height: 0, border: 'none', position: 'absolute', opacity: 0, pointerEvents: 'none' }}
              />
            )}

            <Music size={14} className="text-purple-400 shrink-0" />
            <span className="text-white/60 text-xs truncate max-w-[100px]">{playlist[current].title}</span>

            <button aria-label={playing ? 'Pausar música' : 'Reproduzir música'} onClick={togglePlay} className="text-purple-400 hover:text-white transition-colors">
              {playing ? <Pause size={14} /> : <Play size={14} />}
            </button>

            <button aria-label={muted ? 'Ativar som' : 'Desativar som'} onClick={() => setMuted(m => !m)} className="text-purple-400 hover:text-white transition-colors">
              {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>

            <button
              onClick={() => setCurrent(c => (c + 1) % playlist.length)}
              className="text-white/30 hover:text-white text-xs transition-colors"
              title="Próxima faixa"
            >
              ↷
            </button>

            <button
              aria-label="Fechar player"
              onClick={() => { setEnabled(false); localStorage.setItem('musicEnabled', 'false'); }}
              className="text-white/20 hover:text-white/60 transition-colors"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
