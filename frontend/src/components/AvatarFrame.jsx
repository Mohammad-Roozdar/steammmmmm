'use client';

const FRAMES = [
  { id: 'none', name: 'بدون قاب', gradient: '' },
  { id: 'gold', name: 'طلایی', gradient: 'from-yellow-400 via-yellow-500 to-orange-500' },
  { id: 'fire', name: 'آتشین', gradient: 'from-red-500 via-orange-500 to-yellow-500' },
  { id: 'ice', name: 'یخی', gradient: 'from-cyan-400 via-blue-500 to-indigo-500' },
  { id: 'neon', name: 'نئون', gradient: 'from-pink-500 via-purple-500 to-cyan-400' },
  { id: 'rainbow', name: 'رنگین‌کمان', gradient: 'from-red-500 via-yellow-500 via-green-500 to-purple-500' }
];

export function getFrame(id) {
  return FRAMES.find((f) => f.id === id) || FRAMES[0];
}

export function FramedAvatar({ src, username, frameId = 'gold', size = 96 }) {
  const frame = getFrame(frameId);

  const inner = src ? (
    <img src={src} className="w-full h-full object-cover rounded-full" alt={username} />
  ) : (
    <div className="w-full h-full bg-gradient-to-br from-[#66c0f4] to-[#2a475e] flex items-center justify-center text-3xl font-bold text-white rounded-full">
      {username?.[0]?.toUpperCase()}
    </div>
  );

  if (frameId === 'none') {
    return (
      <div className="rounded-full overflow-hidden" style={{ width: size, height: size }}>
        {inner}
      </div>
    );
  }

  return (
    <div
      className={`rounded-full p-1 bg-gradient-to-br ${frame.gradient} shadow-lg animate-glow`}
      style={{ width: size, height: size }}
    >
      <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#171a21]">
        {inner}
      </div>
    </div>
  );
}

export const AVATAR_FRAMES = FRAMES;