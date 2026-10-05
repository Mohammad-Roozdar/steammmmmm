'use client';
import Link from 'next/link';
import { Star, Heart, Play, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';

export default function GameCard({ game, big }) {
  const [liked, setLiked] = useState(false);
  const [hover, setHover] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const hoverTimeout = useRef();

  useEffect(() => {
    if (!getUser()) return;
    api.get('/wishlist').then((r) => {
      setLiked(r.data.some((w) => w.GameId === game.id));
    }).catch(() => {});
  }, [game.id]);

  const toggleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!getUser()) {
      window.location.href = '/login';
      return;
    }
    try {
      const { data } = await api.post(`/wishlist/${game.id}`);
      setLiked(data.liked);
    } catch {}
  };

  const onMouseEnter = () => {
    setHover(true);
    if (game.trailerUrl) {
      hoverTimeout.current = setTimeout(() => setShowTrailer(true), 1500);
    }
  };

  const onMouseLeave = () => {
    setHover(false);
    setShowTrailer(false);
    clearTimeout(hoverTimeout.current);
  };

  const finalPrice = Math.round(game.basePrice * (1 - game.discount / 100));

  const trailerId = game.trailerUrl
    ? game.trailerUrl.split('/embed/')[1]?.split('?')[0]
    : null;

  const isNew = new Date() - new Date(game.createdAt) < 7 * 24 * 60 * 60 * 1000;

  return (
    <div
      className="relative group hover-lift animate-fade-in"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link
        href={`/games/${game.id}`}
        className="block bg-[#171a21] rounded-xl overflow-hidden border border-[#2a475e] hover:border-[#66c0f4] transition-all duration-300"
      >
        <div className="aspect-[3/4] bg-[#0f1922] relative overflow-hidden">
          {/* ویدیو یا عکس */}
          {showTrailer && trailerId ? (
            <iframe
              src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerId}&modestbranding=1&showinfo=0`}
              className="w-full h-full pointer-events-none scale-150"
              allow="autoplay; encrypted-media"
              frameBorder="0"
            />
          ) : game.coverImage ? (
            <img
              src={game.coverImage}
              alt={game.title}
              loading="lazy"
              className={`w-full h-full object-cover transition duration-700 ${
                hover ? 'scale-110 brightness-110' : 'scale-100'
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">🎮</div>
          )}

          {/* overlay گرادیانت */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent transition-opacity duration-300 ${
            hover ? 'opacity-100' : 'opacity-60'
          }`} />

          {/* نور درخشان هنگام hover */}
          {hover && !showTrailer && (
            <div className="absolute inset-0 bg-gradient-to-tr from-[#66c0f4]/20 to-transparent pointer-events-none" />
          )}

          {/* بج تخفیف */}
          {game.discount > 0 && (
            <div className="absolute top-2 left-2 bg-gradient-to-l from-green-500 to-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg animate-pulse-ring">
              -{game.discount}%
            </div>
          )}

          {/* بج جدید */}
          {isNew && (
            <div className="absolute top-2 right-2 bg-gradient-to-l from-blue-500 to-cyan-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg animate-pulse">
              🆕 جدید
            </div>
          )}

          {/* بج ویژه */}
          {game.isFeatured && !isNew && (
            <div className="absolute top-2 right-2 bg-gradient-to-l from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1">
              <Sparkles size={12} /> ویژه
            </div>
          )}

          {/* ناموجود */}
          {game.stock === 0 && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
              <span className="text-red-400 font-bold text-lg px-4 py-2 border-2 border-red-400 rounded-lg">
                ناموجود
              </span>
            </div>
          )}

          {/* آیکون ویدیو */}
          {game.trailerUrl && !showTrailer && (
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
              hover ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}>
              <div className="w-14 h-14 rounded-full bg-[#66c0f4]/90 backdrop-blur flex items-center justify-center shadow-2xl animate-pulse-ring">
                <Play size={24} className="text-[#171a21] fill-[#171a21] ml-1" />
              </div>
            </div>
          )}

          {/* اطلاعات پایین کارت هنگام hover */}
          {hover && (
            <div className="absolute bottom-0 right-0 left-0 p-3 bg-gradient-to-t from-black to-transparent">
              <div className="flex items-center gap-1 text-xs text-white mb-1">
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                <span className="font-bold">{game.rating?.toFixed(1) || '0.0'}</span>
                <span className="text-gray-400 mr-2">
                  {game.ratingCount || 0} نظر
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="p-3">
          <h3 className="font-bold mb-2 truncate group-hover:text-[#66c0f4] transition">
            {game.title}
          </h3>

          {game.genres && game.genres !== '[]' && (
            <div className="text-xs text-gray-500 mb-2 truncate">
              {(() => { try { return JSON.parse(game.genres).slice(0, 2).join(' • '); } catch { return ''; } })()}
            </div>
          )}

          <div className="flex items-center justify-between">
            {game.discount > 0 ? (
              <div>
                <div className="text-xs text-gray-500 line-through">
                  {game.basePrice.toLocaleString('en-US')}
                </div>
                <div className="text-[#66c0f4] font-bold">
                  {finalPrice.toLocaleString('en-US')} ت
                </div>
              </div>
            ) : (
              <div className="text-[#66c0f4] font-bold">
                {finalPrice.toLocaleString('en-US')} ت
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* دکمه قلب */}
      <button
        onClick={toggleLike}
        className={`absolute top-2 right-14 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
          liked
            ? 'bg-red-500 text-white scale-100'
            : 'bg-black/60 text-white opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
        }`}
      >
        <Heart size={16} className={liked ? 'fill-white' : ''} />
      </button>
    </div>
  );
}