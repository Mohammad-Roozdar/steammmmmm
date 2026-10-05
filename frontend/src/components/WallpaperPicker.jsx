'use client';

const WALLPAPERS = [
  { id: 'gradient1', css: 'bg-gradient-to-l from-[#66c0f4] via-[#4fa8d8] to-[#2a475e]' },
  { id: 'gradient2', css: 'bg-gradient-to-l from-purple-600 via-pink-500 to-red-500' },
  { id: 'gradient3', css: 'bg-gradient-to-l from-emerald-500 via-teal-500 to-cyan-500' },
  { id: 'gradient4', css: 'bg-gradient-to-l from-yellow-500 via-orange-500 to-red-500' },
  { id: 'gradient5', css: 'bg-gradient-to-l from-indigo-600 via-purple-600 to-pink-600' },
  { id: 'gradient6', css: 'bg-gradient-to-l from-slate-900 via-slate-700 to-slate-900' },
  { id: 'dark', css: 'bg-gradient-to-l from-[#0f1922] via-[#171a21] to-[#0f1922]' },
  { id: 'steam', css: 'bg-gradient-to-l from-[#1b2838] via-[#2a475e] to-[#1b2838]' }
];

export function getWallpaper(id) {
  return WALLPAPERS.find((w) => w.id === id) || WALLPAPERS[0];
}

export default function WallpaperPicker({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
      {WALLPAPERS.map((w) => (
        <button
          key={w.id}
          onClick={() => onSelect(w.id)}
          className={`aspect-square rounded-xl ${w.css} border-2 transition hover:scale-110 ${
            selected === w.id ? 'border-[#66c0f4] shadow-lg shadow-[#66c0f4]/50' : 'border-transparent'
          }`}
        />
      ))}
    </div>
  );
}

export { WALLPAPERS };