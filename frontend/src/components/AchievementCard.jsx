'use client';

export default function AchievementCard({ a, size = 'md' }) {
  const sizeClass = size === 'sm'
    ? 'p-3 text-2xl'
    : 'p-4 text-4xl';

  return (
    <div
      className={`rounded-2xl border-2 transition-all duration-300 ${
        a.unlocked
          ? 'bg-gradient-to-br from-[#66c0f4]/10 via-transparent to-[#4fa8d8]/5 border-[#66c0f4]/50 shadow-lg shadow-[#66c0f4]/10 hover:shadow-[#66c0f4]/30 hover:-translate-y-1'
          : 'bg-[#171a21] border-[#2a475e] opacity-50'
      } ${sizeClass}`}
    >
      <div className="flex items-center gap-3">
        <div className={`${a.unlocked ? 'animate-float' : 'grayscale opacity-50'}`}>
          {a.unlocked ? a.icon : '🔒'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold flex items-center gap-1.5 text-sm">
            {a.title}
            {a.unlocked && <span className="text-green-400">✓</span>}
          </div>
          <div className="text-xs text-gray-400 mt-0.5 truncate">{a.desc}</div>
        </div>
      </div>
    </div>
  );
}