'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import GameCard from '@/components/GameCard';
import Billboard from '@/components/Billboard';
import { Filter, Search, X } from 'lucide-react';

function GamesList() {
  const params = useSearchParams();
  const [games, setGames] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState(params.get('q') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/games').then((r) => {
      setGames(r.data);
      setFiltered(r.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = [...games];

    if (search.trim()) {
      result = result.filter((g) =>
        g.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sort === 'cheap') result.sort((a, b) => a.basePrice - b.basePrice);
    if (sort === 'expensive') result.sort((a, b) => b.basePrice - a.basePrice);
    if (sort === 'discount') result.sort((a, b) => b.discount - a.discount);
    if (sort === 'newest') result.sort((a, b) => b.id - a.id);

    setFiltered(result);
  }, [sort, search, games]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">🎮 فروشگاه بازی‌ها</h1>

      <Billboard position="home_top" />

      <div className="bg-[#171a21] p-4 rounded-xl border border-[#2a475e] mb-6 flex flex-wrap gap-4 items-center sticky top-16 z-30">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی بازی..."
            className="w-full bg-[#0f1922] border border-[#2a475e] rounded-lg p-3 pr-10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[#66c0f4]" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-[#0f1922] border border-[#2a475e] rounded-lg p-3"
          >
            <option value="newest">جدیدترین</option>
            <option value="cheap">ارزان‌ترین</option>
            <option value="expensive">گران‌ترین</option>
            <option value="discount">بیشترین تخفیف</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">در حال بارگذاری...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-[#171a21] rounded-xl border border-[#2a475e]">
          🔍 بازی‌ای پیدا نشد
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-500 mb-4">
            {filtered.length} بازی یافت شد
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filtered.map((g) => <GameCard key={g.id} game={g} />)}
          </div>
        </>
      )}
    </div>
  );
}

export default function GamesPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">...</div>}>
      <GamesList />
    </Suspense>
  );
}