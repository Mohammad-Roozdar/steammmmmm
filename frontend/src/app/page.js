'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import Billboard from '@/components/Billboard';
import GameCard from '@/components/GameCard';
import { Flame, Sparkles, TrendingUp, Zap, Gift, Star, Clock } from 'lucide-react';

export default function HomePage() {
  const [games, setGames] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [forYou, setForYou] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/games').then((r) => {
      setGames(r.data);
      setFeatured(r.data.filter((g) => g.isFeatured).slice(0, 5));
      setLoading(false);
    }).catch(() => setLoading(false));

    api.get('/recommendations/top-selling').then((r) => setTopSelling(r.data)).catch(() => {});

    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      api.get('/recommendations/for-you').then((r) => setForYou(r.data)).catch(() => {});
    }
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-12 h-12 border-4 border-[#66c0f4] border-t-transparent rounded-full" />
    </div>
  );

  const discounted = games.filter((g) => g.discount > 0).slice(0, 5);
  const newest = [...games].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <div>
      {featured.length > 0 && <HeroSlider games={featured} />}

      <Billboard position="home_top" />

      <div className="container mx-auto px-4 py-8">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <AdBanner icon={<Zap size={28} />} title="تحویل فوری" desc="فعال‌سازی در کمتر از ۱۰ دقیقه" color="from-yellow-500 to-orange-600" />
          <AdBanner icon={<Gift size={28} />} title="هدیه ویژه" desc="با هر خرید، تخفیف بعدی ۱۰٪" color="from-purple-500 to-pink-600" />
          <AdBanner icon={<Star size={28} />} title="ضمانت بازگشت" desc="اگر بازی فعال نشد، پول برمی‌گرده" color="from-green-500 to-teal-600" />
        </section>

        {newest.length > 0 && (
          <Section title="🆕 تازه‌ترین بازی‌ها" icon={<Clock className="text-[#66c0f4]" />} href="/games">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {newest.map((g) => <GameCard key={g.id} game={g} />)}
            </div>
          </Section>
        )}

        <Billboard position="home_middle" />

        {discounted.length > 0 && (
          <Section title="🔥 پیشنهادهای شگفت‌انگیز" icon={<Flame className="text-orange-500" />} href="/games?sort=discount">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {discounted.map((g) => <GameCard key={g.id} game={g} />)}
            </div>
          </Section>
        )}

        {forYou.length > 0 && (
          <Section title="🎯 پیشنهاد برای تو" icon={<Star className="text-yellow-500" />} href="/games">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {forYou.slice(0, 5).map((g) => <GameCard key={g.id} game={g} />)}
            </div>
          </Section>
        )}

        {topSelling.length > 0 && (
          <Section title="🔥 پرفروش‌ترین‌ها" icon={<TrendingUp className="text-red-500" />} href="/games">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {topSelling.slice(0, 5).map((g) => <GameCard key={g.id} game={g} />)}
            </div>
          </Section>
        )}

        <Section title="🎮 همه بازی‌ها" icon={<TrendingUp className="text-green-500" />} href="/games">
          {games.length === 0 ? (
            <div className="text-center py-20 text-gray-500 bg-[#171a21] rounded-xl border border-[#2a475e]">
              هنوز بازی‌ای اضافه نشده
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {games.slice(0, 15).map((g) => <GameCard key={g.id} game={g} />)}
            </div>
          )}
        </Section>

        <section className="bg-gradient-to-l from-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 mt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">📢 کسب‌وکارت رو تبلیغ کن!</h2>
            <p className="text-white/80">بیلبورد تبلیغاتی در پربازدیدترین جای سایت رزرو کن</p>
          </div>
          <Link href="/advertise" className="bg-white text-purple-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition shrink-0">
            رزرو بیلبورد
          </Link>
        </section>
      </div>
    </div>
  );
}

function HeroSlider({ games }) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    const t = setInterval(() => setIndex((i) => (i + 1) % games.length), 7000);
    return () => clearInterval(t);
  }, [games.length]);

  const g = games[index];
  const finalPrice = Math.round(g.basePrice * (1 - g.discount / 100));
  const banner = g.bannerImage || g.coverImage;

  return (
    <section className="relative h-[550px] md:h-[600px] overflow-hidden">
      <div className="absolute inset-0 transition-all duration-1000">
        {banner && (
          <img
            src={banner}
            alt={g.title}
            key={g.id}
            className={`w-full h-full object-cover transition-all duration-1000 ${
              loaded ? 'scale-110 blur-0' : 'scale-100 blur-lg'
            }`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-l from-[#1b2838] via-[#1b2838]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1b2838] to-transparent" />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#66c0f4] rounded-full opacity-60 animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl animate-fade-in" key={`content-${g.id}`}>
          <div className="inline-block bg-gradient-to-l from-[#66c0f4] to-[#4fa8d8] text-[#171a21] text-xs font-bold px-4 py-1.5 rounded-full mb-4 shadow-lg animate-float">
            ⭐ بازی ویژه
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
            {g.title}
          </h1>
          <p className="text-gray-200 mb-6 line-clamp-2 text-lg">
            {g.shortDescription || g.description}
          </p>
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="text-3xl md:text-4xl font-bold text-[#66c0f4] drop-shadow-lg">
              {finalPrice.toLocaleString('en-US')}
              <span className="text-base text-white mr-2">تومان</span>
            </div>
            {g.discount > 0 && (
              <div className="bg-gradient-to-l from-green-500 to-green-600 text-white text-sm font-bold px-4 py-1.5 rounded-lg shadow-lg animate-pulse-ring">
                {g.discount}% تخفیف
              </div>
            )}
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link
              href={`/games/${g.id}`}
              className="bg-[#66c0f4] text-[#171a21] font-bold px-8 py-3 rounded-lg hover:bg-[#4fa8d8] transition hover:shadow-2xl hover:shadow-[#66c0f4]/50 hover-lift btn-shine"
            >
              مشاهده و خرید
            </Link>
            <Link
              href="/games"
              className="bg-white/10 backdrop-blur text-white font-bold px-8 py-3 rounded-lg hover:bg-white/20 border border-white/20 transition"
            >
              همه بازی‌ها
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {games.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === index
                ? 'w-12 bg-[#66c0f4] shadow-lg shadow-[#66c0f4]/50'
                : 'w-6 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function Section({ title, icon, children, href }) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">{icon} {title}</h2>
        {href && (
          <Link href={href} className="text-sm text-[#66c0f4] hover:underline">
            مشاهده همه →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function AdBanner({ icon, title, desc, color }) {
  return (
    <div className={`bg-gradient-to-l ${color} rounded-xl p-5 flex items-center gap-4 text-white shadow-lg hover:scale-[1.02] transition cursor-pointer`}>
      <div className="bg-white/20 backdrop-blur p-3 rounded-lg">{icon}</div>
      <div>
        <div className="font-bold">{title}</div>
        <div className="text-sm text-white/80">{desc}</div>
      </div>
    </div>
  );
}