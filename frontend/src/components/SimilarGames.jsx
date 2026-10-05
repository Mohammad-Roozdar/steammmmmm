'use client';
import { useEffect, useState } from 'react';
import GameCard from './GameCard';
import api from '@/lib/api';
import { Sparkles } from 'lucide-react';

export default function SimilarGames({ gameId, title = '🎯 بازی‌های مشابه' }) {
  const [games, setGames] = useState([]);

  useEffect(() => {
    api.get(`/recommendations/similar/${gameId}`)
      .then((r) => setGames(r.data))
      .catch(() => {});
  }, [gameId]);

  if (games.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Sparkles className="text-[#66c0f4]" /> {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {games.map((g) => <GameCard key={g.id} game={g} />)}
      </div>
    </section>
  );
}