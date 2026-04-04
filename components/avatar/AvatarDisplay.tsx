'use client';

interface AvatarDisplayProps {
  avatarUrl: string | null;
  name: string;
  size?: number;
}

export function AvatarDisplay({ avatarUrl, name, size = 40 }: AvatarDisplayProps) {
  // JSON avatar: {"color":"#8B5CF6","emoji":"😊"}
  if (avatarUrl?.startsWith('{')) {
    try {
      const { color, emoji } = JSON.parse(avatarUrl);
      return (
        <div
          className="rounded-full flex items-center justify-center shrink-0"
          style={{ width: size, height: size, minWidth: size, background: color || '#8B5CF6' }}
        >
          <span style={{ fontSize: size * 0.5 }}>{emoji || '😊'}</span>
        </div>
      );
    } catch { /* fall through to initials */ }
  }

  // URL avatar
  if (avatarUrl && (avatarUrl.startsWith('http') || avatarUrl.startsWith('/'))) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size, minWidth: size }}
      />
    );
  }

  // Initials fallback
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold"
      style={{ width: size, height: size, minWidth: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}
