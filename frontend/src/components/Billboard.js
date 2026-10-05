'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function Billboard({ position = 'home_top' }) {
  const [ads, setAds] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    api.get('/billboards/active', { params: { position } })
      .then((r) => setAds(r.data))
      .catch(() => {});
  }, [position]);

  useEffect(() => {
    if (ads.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % ads.length), 6000);
    return () => clearInterval(t);
  }, [ads.length]);

  if (ads.length === 0) return null;
  const ad = ads[index];

  const click = () => {
    api.post(`/billboards/${ad.id}/click`).catch(() => {});
    if (ad.link) window.open(ad.link, '_blank');
  };

  return (
    <div className="container mx-auto px-4 my-6">
      <div className="relative rounded-xl overflow-hidden border border-[#2a475e] group">
        <div className="text-xs text-gray-500 absolute top-2 right-2 bg-black/60 px-2 py-1 rounded z-10">
          تبلیغ
        </div>
        <button
          onClick={click}
          className="block w-full aspect-[6/1] bg-[#171a21] hover:opacity-95 transition"
        >
          <img
            src={ad.image}
            alt={ad.title}
            className="w-full h-full object-cover"
          />
        </button>
        {ads.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {ads.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1 rounded-full transition-all ${
                  i === index ? 'w-6 bg-white' : 'w-3 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}