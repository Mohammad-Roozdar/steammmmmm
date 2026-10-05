'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';
import { toast } from '@/components/Toast';
import {
  ShoppingCart, Check, Play, Star, Calendar, Building2,
  Tag, Eye, Share2, Heart, Globe, Library, Gift
} from 'lucide-react';
import Reviews from '@/components/Reviews';
import SimilarGames from '@/components/SimilarGames';

export default function GameDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [game, setGame] = useState(null);
  const [regions, setRegions] = useState([]);
  const [regionId, setRegionId] = useState(null);
  const [dlcs, setDlcs] = useState([]);
  const [ownedDLCs, setOwnedDLCs] = useState([]);
  const [owned, setOwned] = useState(false);
  const [checkingOwnership, setCheckingOwnership] = useState(true);
  const [showBuy, setShowBuy] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [creds, setCreds] = useState({ username: '', password: '', guard: '', note: '', discountCode: '', dlcId: null, dlcTitle: '' });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [couponData, setCouponData] = useState(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  useEffect(() => {
    api.get(`/games/${id}`).then((r) => setGame(r.data)).catch(() => {});
    api.get('/regions').then((r) => {
      setRegions(r.data);
      if (r.data.length) setRegionId(r.data[0].id);
    }).catch(() => {});

    api.get(`/dlcs/game/${id}`).then((r) => setDlcs(r.data)).catch(() => {});

    const user = getUser();
    if (user) {
      api.get(`/library/check/${id}`).then((r) => {
        setOwned(r.data.owned);
        setCheckingOwnership(false);
      }).catch(() => setCheckingOwnership(false));

      api.get('/wishlist').then((r) => {
        setLiked(r.data.some((w) => w.GameId === parseInt(id)));
      }).catch(() => {});

      // چک DLCها
      api.get(`/dlcs/game/${id}`).then((r) => {
        Promise.all(r.data.map(d =>
          api.get(`/dlcs/check/${d.id}`).then(res => res.data.owned ? d.id : null).catch(() => null)
        )).then(results => setOwnedDLCs(results.filter(Boolean)));
      }).catch(() => {});
    } else {
      setCheckingOwnership(false);
    }
  }, [id]);

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#66c0f4] border-t-transparent rounded-full" />
      </div>
    );
  }

  const region = regions.find((r) => r.id === regionId);
  const activeItem = creds.dlcId
    ? dlcs.find(d => d.id === creds.dlcId)
    : game;

  const unitPrice = activeItem
    ? Math.round(activeItem.basePrice * (region?.priceMultiplier || 1) * (1 - (activeItem.discount || 0) / 100))
    : 0;
  const originalPrice = activeItem
    ? Math.round(activeItem.basePrice * (region?.priceMultiplier || 1))
    : 0;
  const finalPrice = couponData ? Math.max(0, unitPrice - couponData.discount) : unitPrice;

  let screenshots = [];
  let genres = [];
  let tags = [];
  try {
    screenshots = JSON.parse(game.screenshots || '[]');
    genres = JSON.parse(game.genres || '[]');
    tags = JSON.parse(game.tags || '[]');
  } catch {}

  const bannerImg = game.bannerImage || game.coverImage;

  const toggleLike = async () => {
    const user = getUser();
    if (!user) return router.push('/login?next=/games/' + id);
    try {
      const { data } = await api.post(`/wishlist/${game.id}`);
      setLiked(data.liked);
      toast(data.liked ? 'به علاقه‌مندی‌ها اضافه شد' : 'حذف شد', 'success');
    } catch {}
  };

  const checkCoupon = async () => {
    if (!creds.discountCode.trim()) return;
    setCheckingCoupon(true);
    try {
      const { data } = await api.post('/coupons/check', {
        code: creds.discountCode,
        total: unitPrice
      });
      setCouponData(data);
      toast(`کد اعمال شد: ${data.discount.toLocaleString('en-US')} تخفیف`, 'success');
    } catch (e) {
      setCouponData(null);
      toast(e.response?.data?.error || 'کد نامعتبر', 'error');
    } finally {
      setCheckingCoupon(false);
    }
  };

  const openBuy = (dlcId = null, dlcTitle = '') => {
    const user = getUser();
    if (!user) return router.push('/login?next=/games/' + id);
    setCreds({ ...creds, dlcId, dlcTitle, discountCode: '' });
    setCouponData(null);
    setStep(1);
    setShowBuy(true);
  };

  const submitOrder = async () => {
    if (!creds.username || !creds.password)
      return toast('یوزرنیم و پسورد استیم الزامی است', 'error');
    setLoading(true);
    try {
      await api.post('/orders', {
        gameId: game.id,
        regionId,
        dlcId: creds.dlcId,
        steamUsername: creds.username,
        steamPassword: creds.password,
        steamGuardCode: creds.guard,
        userNote: creds.note,
        discountCode: couponData ? creds.discountCode : null
      });
      setStep(3);
      toast('سفارش ثبت شد', 'success');
    } catch (e) {
      toast(e.response?.data?.error || 'خطا', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* بنر */}
      <div className="relative h-[400px] overflow-hidden bg-[#0f1922]">
        {bannerImg && (
          <img src={bannerImg} alt={game.title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1b2838] via-[#1b2838]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-l from-[#1b2838]/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* ستون چپ */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-[#171a21] rounded-xl overflow-hidden border border-[#2a475e] shadow-2xl">
              {game.coverImage ? (
                <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">🎮</div>
              )}
            </div>

            <div
              onClick={() => game.trailerUrl && setShowTrailer(true)}
              className="aspect-video bg-[#0f1922] rounded-xl overflow-hidden border border-[#2a475e] relative cursor-pointer group"
            >
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition">
                <div className="w-16 h-16 rounded-full bg-[#66c0f4] flex items-center justify-center group-hover:scale-110 transition">
                  <Play size={28} className="text-[#171a21] fill-[#171a21] ml-1" />
                </div>
              </div>
              <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                🎬 تیزر
              </div>
            </div>

            <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-4 space-y-3 text-sm">
              <InfoRow icon={<Building2 size={14} />} label="سازنده" value={game.developer || '—'} />
              <InfoRow icon={<Building2 size={14} />} label="ناشر" value={game.publisher || '—'} />
              <InfoRow icon={<Calendar size={14} />} label="انتشار" value={game.releaseDate ? new Date(game.releaseDate).toLocaleDateString('fa-IR') : '—'} />
              <InfoRow icon={<Eye size={14} />} label="بازدید" value={game.views || 0} />
            </div>
          </div>

          {/* ستون راست */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{game.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-white font-bold">{game.rating?.toFixed(1) || '0.0'}</span>
                </div>
                <span>•</span>
                <span>{game.views || 0} بازدید</span>
                {genres.length > 0 && <span>•</span>}
                <div className="flex gap-2 flex-wrap">
                  {genres.map((g, i) => (
                    <span key={i} className="bg-[#2a475e] px-3 py-1 rounded-full text-xs">{g}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={toggleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                  liked ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-[#171a21] border-[#2a475e] hover:border-red-500'
                }`}
              >
                <Heart size={16} className={liked ? 'fill-red-400' : ''} />
                {liked ? 'پسندیدم' : 'علاقه‌مندم'}
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast('لینک کپی شد', 'success'); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2a475e] bg-[#171a21] hover:border-[#66c0f4]"
              >
                <Share2 size={16} /> اشتراک
              </button>
            </div>

            {game.shortDescription && (
              <p className="text-gray-300 leading-relaxed text-lg">{game.shortDescription}</p>
            )}

            {/* ریجن‌ها */}
            <div>
              <div className="flex items-center gap-2 text-sm font-bold mb-3">
                <Globe size={16} className="text-[#66c0f4]" /> انتخاب ریجن:
              </div>
              <div className="flex flex-wrap gap-2">
                {regions.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRegionId(r.id)}
                    className={`px-4 py-2 rounded-lg border-2 transition text-sm ${
                      regionId === r.id ? 'border-[#66c0f4] bg-[#66c0f4]/10 text-white' : 'border-[#2a475e] hover:border-[#66c0f4]/50'
                    }`}
                  >
                    <span className="text-lg ml-1">{r.flag}</span> {r.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 🎁 DLCها */}
            {dlcs.length > 0 && (
              <div className="bg-gradient-to-l from-purple-900/30 to-purple-800/10 border border-purple-500/30 rounded-xl p-5">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-purple-300">
                  <Gift size={18} /> محتواهای اضافی (DLC)
                </h3>
                <div className="space-y-3">
                  {dlcs.map((d) => {
                    const isOwned = ownedDLCs.includes(d.id);
                    const finalDLCPrice = Math.round(d.basePrice * (1 - d.discount / 100) * (region?.priceMultiplier || 1));
                    return (
                      <div key={d.id} className="flex items-center gap-3 bg-[#0f1922] rounded-lg p-3">
                        <div className="w-14 h-16 bg-[#171a21] rounded overflow-hidden shrink-0">
                          {d.coverImage ? (
                            <img src={d.coverImage} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">🎁</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm">{d.title}</div>
                          {d.description && <div className="text-xs text-gray-500 truncate">{d.description}</div>}
                        </div>
                        {isOwned ? (
                          <div className="bg-green-500/20 text-green-400 text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
                            <Check size={14} /> خریداری شده
                          </div>
                        ) : (
                          <button
                            onClick={() => openBuy(d.id, d.title)}
                            className="bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition whitespace-nowrap"
                          >
                            {finalDLCPrice.toLocaleString('en-US')} ت
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 🛒 کارت خرید */}
            <div className="bg-gradient-to-l from-[#171a21] to-[#1a2a3a] border border-[#2a475e] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">قیمت نهایی</div>
                  {game.discount > 0 && (
                    <div className="text-sm text-gray-500 line-through">
                      {originalPrice.toLocaleString('en-US')} تومان
                    </div>
                  )}
                  <div className="text-3xl font-bold text-[#66c0f4]">
                    {finalPrice.toLocaleString('en-US')}
                    <span className="text-base font-normal mr-2">تومان</span>
                  </div>
                </div>
                {game.discount > 0 && (
                  <div className="bg-green-500 text-white font-bold px-4 py-2 rounded-lg">
                    {game.discount}%-
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm mb-4">
                <div className={`w-2 h-2 rounded-full ${game.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={game.stock > 0 ? 'text-green-400' : 'text-red-400'}>
                  {game.stock > 0 ? `${game.stock} عدد موجود` : 'ناموجود'}
                </span>
              </div>

              {checkingOwnership ? (
                <div className="w-full bg-[#2a475e] py-4 rounded-lg flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#66c0f4] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">در حال بررسی...</span>
                </div>
              ) : owned ? (
                <div className="space-y-3">
                  <div className="w-full bg-green-500/20 border-2 border-green-500/40 text-green-400 font-bold py-4 rounded-lg flex items-center justify-center gap-2">
                    <Check size={20} /> شما این بازی رو دارید
                  </div>
                  <Link
                    href="/profile"
                    className="w-full bg-[#2a475e] hover:bg-[#3a5a78] font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition text-sm"
                  >
                    <Library size={16} /> مشاهده در کتابخانه
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => openBuy()}
                  disabled={game.stock === 0}
                  className="w-full bg-[#66c0f4] text-[#171a21] font-bold py-4 rounded-lg hover:bg-[#4fa8d8] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
                >
                  <ShoppingCart size={20} />
                  {game.stock === 0 ? 'ناموجود' : 'خرید و فعال‌سازی روی اکانت'}
                </button>
              )}
            </div>

            {tags.length > 0 && (
              <div>
                <div className="text-sm font-bold mb-2 flex items-center gap-2">
                  <Tag size={14} /> تگ‌ها:
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t, i) => (
                    <span key={i} className="bg-[#2a475e] text-xs px-3 py-1 rounded-full text-gray-300">#{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {screenshots.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">📸 تصاویر بازی</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {screenshots.map((s, i) => (
                <div key={i} onClick={() => setScreenshot(s)} className="aspect-video bg-[#171a21] rounded-lg overflow-hidden border border-[#2a475e] cursor-pointer hover:border-[#66c0f4] transition">
                  <img src={s} alt="" className="w-full h-full object-cover hover:scale-105 transition" />
                </div>
              ))}
            </div>
          </section>
        )}

        {game.description && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">📝 درباره این بازی</h2>
            <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{game.description}</p>
            </div>
          </section>
        )}
      </div>
        {/* ⭐ نظرات کاربران */}
        <Reviews gameId={game.id} />

        {/* 🎯 بازی‌های مشابه */}
        <SimilarGames gameId={game.id} />
      {showTrailer && game.trailerUrl && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setShowTrailer(false)}>
          <div className="w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
            <iframe src={game.trailerUrl} className="w-full h-full" allowFullScreen allow="autoplay; encrypted-media" />
          </div>
        </div>
      )}

      {screenshot && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setScreenshot(null)}>
          <img src={screenshot} className="max-w-full max-h-full rounded-lg" />
        </div>
      )}

      {/* مودال خرید */}
      {showBuy && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#171a21] border border-[#2a475e] rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-auto">
            {step === 1 && (
              <>
                <h3 className="text-xl font-bold mb-4">
                  🔐 {creds.dlcId ? `خرید DLC: ${creds.dlcTitle}` : 'اطلاعات اکانت استیم'}
                </h3>
                <p className="text-sm text-gray-400 mb-4">اطلاعات شما رمزنگاری شده ذخیره می‌شود</p>
                <div className="space-y-3">
                  <input placeholder="یوزرنیم استیم" value={creds.username} onChange={(e) => setCreds({ ...creds, username: e.target.value })}
                    className="w-full bg-[#0f1922] border border-[#2a475e] rounded p-3" />
                  <input type="password" placeholder="پسورد استیم" value={creds.password} onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                    className="w-full bg-[#0f1922] border border-[#2a475e] rounded p-3" />
                  <input placeholder="کد گارد (اختیاری)" value={creds.guard} onChange={(e) => setCreds({ ...creds, guard: e.target.value })}
                    className="w-full bg-[#0f1922] border border-[#2a475e] rounded p-3" />
                  <textarea placeholder="توضیحات (اختیاری)" value={creds.note} onChange={(e) => setCreds({ ...creds, note: e.target.value })} rows={2}
                    className="w-full bg-[#0f1922] border border-[#2a475e] rounded p-3" />

                  <div className="bg-[#0f1922] border border-[#2a475e] rounded p-3">
                    <label className="text-xs text-gray-400 block mb-2">🎟️ کد تخفیف (اختیاری)</label>
                    <div className="flex gap-2">
                      <input placeholder="مثلا WELCOME10" value={creds.discountCode}
                        onChange={(e) => setCreds({ ...creds, discountCode: e.target.value.toUpperCase() })}
                        className="flex-1 bg-[#171a21] border border-[#2a475e] rounded p-2 font-mono" />
                      <button onClick={checkCoupon} disabled={checkingCoupon || !creds.discountCode}
                        className="bg-[#2a475e] hover:bg-[#3a5a78] px-4 rounded text-sm disabled:opacity-50">
                        {checkingCoupon ? '...' : 'اعمال'}
                      </button>
                    </div>
                    {couponData && (
                      <div className="text-xs text-green-400 mt-2">✅ {couponData.discount.toLocaleString('en-US')} تومان تخفیف</div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button onClick={() => setShowBuy(false)} className="flex-1 bg-[#2a475e] py-3 rounded hover:bg-[#3a5a78]">انصراف</button>
                  <button onClick={submitOrder} disabled={loading}
                    className="flex-1 bg-[#66c0f4] text-[#171a21] font-bold py-3 rounded hover:bg-[#4fa8d8] disabled:opacity-50">
                    {loading ? 'در حال ثبت...' : `ثبت (${finalPrice.toLocaleString('en-US')} ت)`}
                  </button>
                </div>
              </>
            )}
            {step === 3 && (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">سفارش ثبت شد ✅</h3>
                <p className="text-gray-400 mb-6">از پروفایل، پیگیر سفارشت باش</p>
                <div className="flex gap-2">
                  <button onClick={() => router.push('/orders')} className="flex-1 bg-[#66c0f4] text-[#171a21] font-bold py-3 rounded">سفارشات</button>
                  <button onClick={() => router.push('/profile')} className="flex-1 bg-[#2a475e] py-3 rounded">پروفایل</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500 flex items-center gap-1">{icon} {label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}