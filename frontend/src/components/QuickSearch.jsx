'use client';
import { useEffect, useState } from 'react';
import { Search, X, Command } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

export default function QuickSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (q.length < 2) return setResults([]);
    const t = setTimeout(() => {
      api.get('/games').then((r) => {
        const games = r.data.filter((g) =>
          g.title.toLowerCase().includes(q.toLowerCase())
        ).slice(0, 6);
        setResults(games);
      });
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-fade-in"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-[#171a21] border border-[#2a475e] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b border-[#2a475e]">
          <Search size={20} className="text-[#66c0f4]" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجوی بازی..."
            className="flex-1 bg-transparent outline-none text-lg"
          />
          <button onClick={() => setOpen(false)} className="p-1 hover:bg-[#2a475e] rounded">
            <X size={18} />
          </button>
        </div>

        {q.length < 2 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            شروع به تایپ کن...
          </div>
        ) : results.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            نتیجه‌ای یافت نشد
          </div>
        ) : (
          <div className="max-h-96 overflow-auto">
            {results.map((g) => (
              <Link
                key={g.id}
                href={`/games/${g.id}`}
                onClick={() => { setOpen(false); setQ(''); }}
                className="flex items-center gap-3 p-3 hover:bg-[#2a475e] transition"
              >
                <div className="w-12 h-16 bg-[#0f1922] rounded overflow-hidden shrink-0">
                  {g.coverImage && <img src={g.coverImage} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm">{g.title}</div>
                  <div className="text-xs text-[#66c0f4]">
                    {Math.round(g.basePrice * (1 - g.discount / 100)).toLocaleString('en-US')} ت
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="p-3 border-t border-[#2a475e] text-xs text-gray-500 flex items-center justify-between">
          <span>Enter رو بزن تا بری</span>
          <span className="flex items-center gap-1">
            <Command size={12} /> + K برای باز کردن
          </span>
        </div>
      </div>
    </div>
  );
}