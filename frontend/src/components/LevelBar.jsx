'use client';
import { Flame } from 'lucide-react';

export default function LevelBar({ points = 0, level = 'برنز', levelIcon = '🥉', nextLevel, neededForNext = 0 }) {
  const levels = [
    { name: 'برنز', icon: '🥉', min: 0, max: 50 },
    { name: 'نقره‌ای', icon: '🥈', min: 50, max: 150 },
    { name: 'طلایی', icon: '🥇', min: 150, max: 300 },
    { name: 'الماس', icon: '💎', min: 300, max: 999999 }
  ];

  const current = levels.find((l) => l.name === level) || levels[0];
  const progress = Math.min(100, ((points - current.min) / (current.max - current.min)) * 100);

  return (
    <div className="bg-[#171a21] border border-[#2a475e] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl animate-float">{levelIcon}</div>
          <div>
            <div className="font-bold text-lg">{level}</div>
            <div className="text-xs text-gray-400">{points} XP</div>
          </div>
        </div>
        {nextLevel && (
          <div className="text-right text-xs text-gray-400">
            <Flame size={14} className="inline text-orange-400" />
            <div>{neededForNext} خرید تا {nextLevel}</div>
          </div>
        )}
      </div>
      <div className="h-3 bg-[#0f1922] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-l from-[#66c0f4] to-[#4fa8d8] rounded-full transition-all duration-1000 shadow-lg shadow-[#66c0f4]/50"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>سطح فعلی</span>
        <span>{progress.toFixed(0)}% تا {nextLevel || 'بالاترین سطح'}</span>
      </div>
    </div>
  );
}