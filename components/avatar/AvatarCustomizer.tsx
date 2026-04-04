'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AvatarDisplay } from './AvatarDisplay';

const COLORS = [
  { id: 'purple', value: '#8B5CF6' },
  { id: 'blue', value: '#3B82F6' },
  { id: 'green', value: '#10B981' },
  { id: 'orange', value: '#F59E0B' },
  { id: 'pink', value: '#EC4899' },
  { id: 'cyan', value: '#06B6D4' },
];

const EMOJIS = ['😊', '🤓', '😎', '🦊', '🐱', '🦉'];

interface AvatarCustomizerProps {
  currentAvatarUrl: string | null;
  profileId: string;
  userName: string;
  onSave: (newAvatarUrl: string) => void;
  onClose: () => void;
}

export function AvatarCustomizer({ currentAvatarUrl, profileId, userName, onSave, onClose }: AvatarCustomizerProps) {
  let initialColor = '#8B5CF6';
  let initialEmoji = '😊';
  if (currentAvatarUrl?.startsWith('{')) {
    try {
      const parsed = JSON.parse(currentAvatarUrl);
      initialColor = parsed.color || initialColor;
      initialEmoji = parsed.emoji || initialEmoji;
    } catch { /* use defaults */ }
  }

  const [color, setColor] = useState(initialColor);
  const [emoji, setEmoji] = useState(initialEmoji);
  const [saving, setSaving] = useState(false);

  const avatarUrl = JSON.stringify({ color, emoji });

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', profileId);
    onSave(avatarUrl);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="glass rounded-2xl p-6 max-w-xs w-full space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-white font-bold text-center">Personalizar avatar</h3>

        {/* Preview */}
        <div className="flex justify-center">
          <AvatarDisplay avatarUrl={avatarUrl} name={userName} size={80} />
        </div>

        {/* Colors */}
        <div>
          <p className="text-white/50 text-xs font-medium mb-2">Cor</p>
          <div className="flex gap-3 justify-center">
            {COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => setColor(c.value)}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{ background: c.value, border: color === c.value ? '3px solid white' : '3px solid transparent' }}
              >
                {color === c.value && <Check size={16} className="text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* Emojis */}
        <div>
          <p className="text-white/50 text-xs font-medium mb-2">Rosto</p>
          <div className="flex gap-3 justify-center">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-xl transition-transform hover:scale-110"
                style={{
                  background: emoji === e ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                  border: emoji === e ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent',
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-white/50 hover:text-white bg-white/5 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
