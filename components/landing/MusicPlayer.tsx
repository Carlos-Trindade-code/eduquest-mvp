"use client";
import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

// Playlist de músicas para concentração (YouTube ou arquivos livres de direitos)
const playlist = [
  {
    title: 'Frequência Alfa - Concentração',
    url: 'https://www.youtube.com/embed/1HzlFQwQK2c?autoplay=0',
  },
  {
    title: 'Música Relaxante para Estudo',
    url: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=0',
  },
];

export function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [volume, setVolume] = useState(1);

  // Salva preferência no localStorage
  useEffect(() => {
    localStorage.setItem('musicPlayerPlaying', playing ? 'true' : 'false');
    localStorage.setItem('musicPlayerCurrent', String(current));
  }, [playing, current]);

  useEffect(() => {
    const savedPlaying = localStorage.getItem('musicPlayerPlaying');
    const savedCurrent = localStorage.getItem('musicPlayerCurrent');
    if (savedPlaying) setPlaying(savedPlaying === 'true');
    if (savedCurrent) setCurrent(Number(savedCurrent));
  }, []);

  return (
    <div className="bg-white/10 rounded-xl p-4 flex flex-col items-center shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <button
          className="p-2 rounded-full bg-purple-500/20 hover:bg-purple-500/40"
          onClick={() => setPlaying(!playing)}
          aria-label={playing ? 'Pausar música' : 'Tocar música'}
        >
          {playing ? <Pause className="w-5 h-5 text-purple-400" /> : <Play className="w-5 h-5 text-purple-400" />}
        </button>
        <span className="text-sm text-white/80 font-medium">
          {playlist[current].title}
        </span>
        <button
          className="p-2 rounded-full bg-purple-500/20 hover:bg-purple-500/40"
          onClick={() => setVolume(volume === 1 ? 0 : 1)}
          aria-label={volume === 1 ? 'Silenciar' : 'Ativar som'}
        >
          {volume === 1 ? <Volume2 className="w-5 h-5 text-purple-400" /> : <VolumeX className="w-5 h-5 text-purple-400" />}
        </button>
      </div>
      <div className="w-full aspect-video rounded-lg overflow-hidden">
        {playing && (
          <iframe
            src={playlist[current].url + (volume === 0 ? '&mute=1' : '')}
            title={playlist[current].title}
            width="100%"
            height="100%"
            allow="autoplay"
            className="w-full h-full border-none"
          />
        )}
      </div>
      <div className="flex gap-2 mt-2">
        {playlist.map((track, idx) => (
          <button
            key={track.title}
            className={`px-2 py-1 rounded ${current === idx ? 'bg-purple-500 text-white' : 'bg-purple-500/20 text-purple-200'}`}
            onClick={() => setCurrent(idx)}
          >
            {track.title}
          </button>
        ))}
      </div>
    </div>
  );
}
