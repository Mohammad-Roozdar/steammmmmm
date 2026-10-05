'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';
import GameCard from '@/components/GameCard';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getUser()) return router.push('/login?next=/wishlist');
    api.get('/wishlist').then((r) => {
      setItems(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20">...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Heart className="text-red-500 fill-red-500" /> علاقه‌مندی‌های من
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-[#171a21] rounded-xl border border-[#2a475e]">
          <Heart size={48} className="mx-auto mb-4 opacity-30" />
          هنوز بازی‌ای به علاقه‌مندی‌ها اضافه نکردی
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {items.map((w) => w.Game && <GameCard key={w.id} game={w.Game} />)}
        </div>
      )}
    </div>
  );
}