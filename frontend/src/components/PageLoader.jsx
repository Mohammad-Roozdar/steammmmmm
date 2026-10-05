'use client';
import { useEffect, useState } from 'react';
import { Gamepad2 } from 'lucide-react';

export default function PageLoader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 20;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => setLoading(false), 400);
      }
      setProgress(p);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#0f1922] flex items-center justify-center transition-all duration-500 ${
        progress >= 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="text-center">
        <div className="relative">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 border-4 border-[#2a475e] rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-[#66c0f4] rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-[#66c0f4] animate-pulse">
              <Gamepad2 size={32} />
            </div>
          </div>
        </div>

        <div className="text-2xl font-bold text-[#66c0f4] mb-2 animate-pulse">
          SteamClub
        </div>
        <div className="text-sm text-gray-500 mb-4">در حال بارگذاری...</div>

        <div className="w-64 h-1.5 bg-[#2a475e] rounded-full overflow-hidden mx-auto">
          <div
            className="h-full bg-gradient-to-l from-[#66c0f4] to-[#4fa8d8] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-gray-600 mt-2">{Math.round(progress)}%</div>
      </div>
    </div>
  );
}