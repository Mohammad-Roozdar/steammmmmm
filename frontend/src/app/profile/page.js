'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';
import { toast } from '@/components/Toast';
import Heatmap from '@/components/Heatmap';
import Timeline from '@/components/Timeline';
import LevelBar from '@/components/LevelBar';
import AchievementCard from '@/components/AchievementCard';
import { FramedAvatar, AVATAR_FRAMES } from '@/components/AvatarFrame';
import WallpaperPicker, { getWallpaper } from '@/components/WallpaperPicker';
import {
  User, Mail, Phone, Package, Heart, Wallet, Save, Lock, Camera,
  TrendingUp, TrendingDown, Plus, Award, MessageSquare, BarChart3,
  Shield, Download, Trash2, Star, Trophy, Target, Settings,
  Calendar, Activity, CheckCircle, AlertTriangle, Palette,
  Sparkles, Zap, Library, Search, Play, Grid3x3, List,
  Send, Bot, Headphones, ArrowRight, Bell, Gift, X
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const TABS = [
  { id: 'home', label: 'خانه', icon: Sparkles },
  { id: 'library', label: 'کتابخانه', icon: Library },
  { id: 'messages', label: 'پیام‌ها', icon: MessageSquare },
  { id: 'info', label: 'اطلاعات', icon: User },
  { id: 'stats', label: 'آمار', icon: BarChart3 },
  { id: 'wallet', label: 'کیف پول', icon: Wallet },
  { id: 'reviews', label: 'نظرات', icon: MessageSquare },
  { id: 'achievements', label: 'دستاوردها', icon: Trophy },
  { id: 'loyalty', label: 'باشگاه', icon: Award },
  { id: 'security', label: 'امنیت', icon: Shield },
  { id: 'appearance', label: 'ظاهر', icon: Palette },
  { id: 'settings', label: 'تنظیمات', icon: Settings }
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ username: '', phone: '', bio: '', avatar: '' });
  const [pass, setPass] = useState({ current: '', newPassword: '', confirm: '' });
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loyalty, setLoyalty] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [heatmap, setHeatmap] = useState({});
  const [timeline, setTimeline] = useState([]);
  const [topGames, setTopGames] = useState([]);
  const [prefs, setPrefs] = useState({ avatarFrame: 'gold', wallpaper: 'gradient1' });

  // 📚 Library
  const [library, setLibrary] = useState([]);
  const [libraryStats, setLibraryStats] = useState(null);
  const [libraryView, setLibraryView] = useState('grid');
  const [librarySearch, setLibrarySearch] = useState('');
  const [librarySort, setLibrarySort] = useState('newest');

  // 💬 Messages
  const [unreadCounts, setUnreadCounts] = useState({ bot: 0, support: 0 });

  const [chargeAmount, setChargeAmount] = useState(50000);
  const [charging, setCharging] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.push('/login?next=/profile');
      return;
    }

    const loadAll = async () => {
      try {
        const results = await Promise.allSettled([
          api.get('/users/me'),
          api.get('/profile/stats'),
          api.get('/profile/my-reviews'),
          api.get('/profile/achievements'),
          api.get('/loyalty/my-stats'),
          api.get('/wallet/transactions'),
          api.get('/profile/sessions'),
          api.get('/profile/heatmap'),
          api.get('/profile/timeline'),
          api.get('/profile/top-games'),
          api.get('/library'),
          api.get('/library/stats'),
          api.get('/messages/unread')
        ]);

        const [uRes, sRes, rRes, aRes, lRes, tRes, ssRes, hRes, tlRes, tgRes, libRes, libStatsRes, unreadRes] = results;

        if (uRes.status === 'fulfilled') {
          const userData = uRes.value.data;
          setUser(userData);
          setForm({
            username: userData.username || '',
            phone: userData.phone || '',
            bio: userData.bio || '',
            avatar: userData.avatar || ''
          });
          try {
            const p = JSON.parse(userData.preferences || '{}');
            setPrefs({
              avatarFrame: p.avatarFrame || 'gold',
              wallpaper: p.wallpaper || 'gradient1'
            });
          } catch {}
        } else {
          setError('خطا در بارگذاری');
          setLoading(false);
          return;
        }

        if (sRes.status === 'fulfilled') setStats(sRes.value.data);
        if (rRes.status === 'fulfilled') setReviews(rRes.value.data);
        if (aRes.status === 'fulfilled') setAchievements(aRes.value.data);
        if (lRes.status === 'fulfilled') setLoyalty(lRes.value.data);
        if (tRes.status === 'fulfilled') setTransactions(tRes.value.data);
        if (ssRes.status === 'fulfilled') setSessions(ssRes.value.data);
        if (hRes.status === 'fulfilled') setHeatmap(hRes.value.data);
        if (tlRes.status === 'fulfilled') setTimeline(tlRes.value.data);
        if (tgRes.status === 'fulfilled') setTopGames(tgRes.value.data);
        if (libRes.status === 'fulfilled') setLibrary(libRes.value.data);
        if (libStatsRes.status === 'fulfilled') setLibraryStats(libStatsRes.value.data);
        if (unreadRes.status === 'fulfilled') setUnreadCounts(unreadRes.value.data);

        setLoading(false);
      } catch (e) {
        setError('خطا');
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  const saveInfo = async () => {
    try {
      await api.patch('/users/me', form);
      toast('ذخیره شد', 'success');
      const updated = { ...getUser(), username: form.username, avatar: form.avatar };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser({ ...user, ...form });
    } catch (e) {
      toast(e.response?.data?.error || 'خطا', 'error');
    }
  };

  const saveAppearance = async (newPrefs) => {
    setPrefs(newPrefs);
    try {
      await api.patch('/users/me/appearance', newPrefs);
      toast('ظاهر ذخیره شد', 'success');
    } catch {
      toast('خطا', 'error');
    }
  };

  const savePassword = async () => {
    if (pass.newPassword !== pass.confirm) return toast('پسوردها یکسان نیستند', 'error');
    if (pass.newPassword.length < 6) return toast('حداقل ۶ کاراکتر', 'error');
    try {
      await api.patch('/users/me/password', {
        current: pass.current,
        newPassword: pass.newPassword
      });
      toast('پسورد تغییر کرد', 'success');
      setPass({ current: '', newPassword: '', confirm: '' });
    } catch (e) {
      toast(e.response?.data?.error || 'خطا', 'error');
    }
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast('حجم بیشتر از ۵MB', 'error');

    setUploadingAvatar(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const { data } = await api.post('/upload?type=avatars', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm({ ...form, avatar: data.url });
      toast('آپلود شد', 'success');
    } catch {
      toast('خطا', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const chargeWallet = async () => {
    if (chargeAmount < 10000) return toast('حداقل ۱۰,۰۰۰', 'error');
    setCharging(true);
    try {
      const { data } = await api.post('/wallet/charge', { amount: chargeAmount });
      setUser({ ...user, wallet: data.newBalance });
      toast(`${chargeAmount.toLocaleString('en-US')} تومان شارژ شد`, 'success');
      api.get('/wallet/transactions').then((r) => setTransactions(r.data));
    } catch (e) {
      toast(e.response?.data?.error || 'خطا', 'error');
    } finally {
      setCharging(false);
    }
  };

  const exportData = async () => {
    try {
      const { data } = await api.get('/profile/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `steamclub-${Date.now()}.json`;
      a.click();
      toast('دانلود شد', 'success');
    } catch {
      toast('خطا', 'error');
    }
  };

  const deleteAccount = async () => {
    if (!deletePassword) return toast('پسورد لازم است', 'error');
    if (!confirm('مطمئنی؟')) return;
    try {
      await api.delete('/users/me', { data: { password: deletePassword } });
      localStorage.clear();
      toast('حساب حذف شد', 'success');
      setTimeout(() => (window.location.href = '/'), 1500);
    } catch (e) {
      toast(e.response?.data?.error || 'خطا', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#66c0f4] border-t-transparent rounded-full mx-auto mb-4" />
          <div className="text-gray-500">در حال بارگذاری...</div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#171a21] border border-red-500/30 rounded-2xl p-8 text-center max-w-md">
          <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">خطا</h2>
          <p className="text-gray-400 text-sm mb-4">{error || 'کاربر یافت نشد'}</p>
          <button
            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            className="bg-[#66c0f4] text-[#171a21] font-bold px-6 py-3 rounded-lg"
          >
            لاگین مجدد
          </button>
        </div>
      </div>
    );
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const wallpaper = getWallpaper(prefs.wallpaper);
  const totalUnread = unreadCounts.bot + unreadCounts.support;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* کارت هدر */}
      <div className={`relative ${wallpaper.css} rounded-3xl overflow-hidden mb-6 shadow-2xl`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-10 -right-10 w-60 h-60 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-10 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative p-6 md:p-10 flex flex-col md:flex-row items-center gap-6">
          <FramedAvatar
            src={form.avatar}
            username={user.username}
            frameId={prefs.avatarFrame}
            size={128}
          />

          <div className="flex-1 text-center md:text-right text-white">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
              <h1 className="text-3xl font-bold drop-shadow-lg">{user.username}</h1>
              {loyalty && <span className="text-3xl">{loyalty.levelIcon}</span>}
            </div>
            <p className="text-white/90 text-sm mb-4 drop-shadow">{user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <Badge icon="📦" text={`${stats?.totalOrders || 0} سفارش`} />
              <Badge icon="📚" text={`${library.length} بازی`} />
              <Badge icon="💰" text={`${(user.wallet || 0).toLocaleString('en-US')} ت`} />
              <Badge icon="🏆" text={`${unlockedCount} دستاورد`} />
            </div>
          </div>

          {stats && (
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 text-white min-w-[160px] shadow-xl border border-white/20">
              <div className="text-xs opacity-80 mb-1">کل خرید</div>
              <div className="text-xl font-bold">
                {Number(stats.totalSpent || 0).toLocaleString('en-US')}
              </div>
              <div className="text-xs opacity-70">تومان</div>
            </div>
          )}
        </div>
      </div>

      {/* تب‌ها */}
      <div className="bg-[#171a21] border border-[#2a475e] rounded-2xl p-2 mb-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 rounded-lg text-sm transition flex items-center gap-2 whitespace-nowrap relative ${
                tab === t.id
                  ? 'bg-[#66c0f4] text-[#171a21] font-bold shadow-lg'
                  : 'hover:bg-[#2a475e] text-gray-400'
              }`}
            >
              <t.icon size={16} /> {t.label}
              {t.id === 'messages' && totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  {totalUnread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ========== Home ========== */}
      {tab === 'home' && (
        <div className="space-y-6 animate-fade-in">
          {loyalty && (
            <LevelBar
              points={loyalty.points}
              level={loyalty.level}
              levelIcon={loyalty.levelIcon}
              nextLevel={loyalty.nextLevel}
              neededForNext={loyalty.neededForNext}
            />
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon="🛍️" label="سفارشات" value={stats?.totalOrders || 0} color="from-blue-500 to-cyan-500" />
            <StatCard icon="📚" label="کتابخانه" value={library.length} color="from-purple-500 to-pink-500" />
            <StatCard icon="⭐" label="نظرها" value={stats?.reviewCount || 0} color="from-yellow-500 to-orange-500" />
            <StatCard icon="💰" label="صرفه‌جویی" value={Number(stats?.totalSaved || 0).toLocaleString('en-US')} color="from-green-500 to-emerald-500" />
          </div>

          <div className="bg-[#171a21] border border-[#2a475e] rounded-2xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Activity className="text-[#66c0f4]" /> فعالیت ۶ ماه اخیر
            </h3>
            <Heatmap data={heatmap} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#171a21] border border-[#2a475e] rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Zap className="text-[#66c0f4]" /> فعالیت‌های اخیر
              </h3>
              <Timeline events={timeline} />
            </div>

            <div className="bg-[#171a21] border border-[#2a475e] rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Star className="text-yellow-500" /> بازی‌های خریداری‌شده
              </h3>
              {topGames.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm">هنوز بازی‌ای نخریدی</div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {topGames.slice(0, 10).map((g) => (
                    <Link
                      key={g.id}
                      href={`/games/${g.id}`}
                      className="block aspect-[3/4] rounded-lg overflow-hidden bg-[#0f1922] border border-[#2a475e] hover:border-[#66c0f4] transition hover:-translate-y-1"
                      title={g.title}
                    >
                      {g.coverImage ? (
                        <img src={g.coverImage} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">🎮</div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {achievements.length > 0 && (
            <div className="bg-[#171a21] border border-[#2a475e] rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Trophy className="text-yellow-500" /> دستاوردهای اخیر
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {achievements.slice(0, 6).map((a) => (
                  <AchievementCard key={a.id} a={a} size="sm" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== Library ========== */}
      {tab === 'library' && (
        <TabLibrary
          library={library}
          stats={libraryStats}
          view={libraryView}
          setView={setLibraryView}
          search={librarySearch}
          setSearch={setLibrarySearch}
          sort={librarySort}
          setSort={setLibrarySort}
        />
      )}

      {/* ========== Messages ========== */}
      {tab === 'messages' && (
        <TabMessages
          unreadCounts={unreadCounts}
          setUnreadCounts={setUnreadCounts}
        />
      )}

      {/* ========== Info ========== */}
      {tab === 'info' && (
        <TabInfo
          user={user} form={form} setForm={setForm}
          uploadAvatar={uploadAvatar} saveInfo={saveInfo}
          uploadingAvatar={uploadingAvatar}
        />
      )}

      {/* ========== Stats ========== */}
      {tab === 'stats' && stats && <TabStats stats={stats} />}

      {/* ========== Wallet ========== */}
      {tab === 'wallet' && (
        <TabWallet
          user={user} transactions={transactions}
          chargeAmount={chargeAmount} setChargeAmount={setChargeAmount}
          chargeWallet={chargeWallet} charging={charging}
        />
      )}

      {/* ========== Reviews ========== */}
      {tab === 'reviews' && <TabReviews reviews={reviews} />}

      {/* ========== Achievements ========== */}
      {tab === 'achievements' && <TabAchievements achievements={achievements} />}

      {/* ========== Loyalty ========== */}
      {tab === 'loyalty' && loyalty && (
        <TabLoyalty loyalty={loyalty} setUser={setUser} user={user} />
      )}

      {/* ========== Security ========== */}
      {tab === 'security' && (
        <TabSecurity pass={pass} setPass={setPass} savePassword={savePassword} sessions={sessions} />
      )}

      {/* ========== Appearance ========== */}
      {tab === 'appearance' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-[#171a21] border border-[#2a475e] rounded-2xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Palette className="text-[#66c0f4]" /> والپیپر پروفایل
            </h3>
            <WallpaperPicker
              selected={prefs.wallpaper}
              onSelect={(w) => saveAppearance({ ...prefs, wallpaper: w })}
            />
            <div className="mt-6">
              <div className="text-sm text-gray-400 mb-2">پیش‌نمایش:</div>
              <div className={`${getWallpaper(prefs.wallpaper).css} h-24 rounded-2xl relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative h-full flex items-center gap-3 px-4">
                  <FramedAvatar src={form.avatar} username={user.username} frameId={prefs.avatarFrame} size={60} />
                  <div className="text-white">
                    <div className="font-bold">{user.username}</div>
                    <div className="text-xs opacity-80">{user.email}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#171a21] border border-[#2a475e] rounded-2xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Sparkles className="text-yellow-500" /> قاب آواتار
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {AVATAR_FRAMES.map((f) => (
                <button
                  key={f.id}
                  onClick={() => saveAppearance({ ...prefs, avatarFrame: f.id })}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition hover:scale-105 ${
                    prefs.avatarFrame === f.id ? 'bg-[#66c0f4]/10 border-2 border-[#66c0f4]' : 'border-2 border-transparent'
                  }`}
                >
                  <FramedAvatar src={form.avatar} username={user.username} frameId={f.id} size={56} />
                  <span className="text-xs">{f.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== Settings ========== */}
      {tab === 'settings' && (
        <TabSettings
          exportData={exportData}
          showDelete={showDelete} setShowDelete={setShowDelete}
          deletePassword={deletePassword} setDeletePassword={setDeletePassword}
          deleteAccount={deleteAccount}
        />
      )}
    </div>
  );
}

/* ============ کامپوننت‌ها ============ */

function Badge({ icon, text }) {
  return (
    <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs text-white flex items-center gap-1 border border-white/20">
      <span>{icon}</span> {text}
    </span>
  );
}

function Field({ label, icon, children, hint }) {
  return (
    <div>
      <label className="text-xs text-gray-400 block mb-2 flex items-center gap-1">
        {icon} {label}
      </label>
      {children}
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full bg-[#0f1922] border border-[#2a475e] rounded-lg p-3 focus:border-[#66c0f4] outline-none transition text-white"
    />
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-xl hover-lift`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs opacity-90 mt-1">{label}</div>
    </div>
  );
}

/* ============ Library Tab ============ */
function TabLibrary({ library, stats, view, setView, search, setSearch, sort, setSort }) {
  let filtered = [...library];

  if (search.trim()) {
    filtered = filtered.filter(g => g.title.toLowerCase().includes(search.toLowerCase()));
  }

  if (sort === 'newest') filtered.sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt));
  else if (sort === 'oldest') filtered.sort((a, b) => new Date(a.purchasedAt) - new Date(b.purchasedAt));
  else if (sort === 'name') filtered.sort((a, b) => a.title.localeCompare(b.title));
  else if (sort === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  return (
    <div className="space-y-6 animate-fade-in">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon="📚" label="بازی‌ها" value={stats.total} color="from-blue-500 to-cyan-500" />
          <StatCard icon="💰" label="ارزش کتابخانه" value={Number(stats.totalSpent).toLocaleString('en-US')} color="from-yellow-500 to-orange-500" />
          <StatCard icon="🎮" label="ژانرها" value={stats.topGenres?.length || 0} color="from-purple-500 to-pink-500" />
          <StatCard icon="⭐" label="میانگین" value={(library.reduce((s, g) => s + (g.rating || 0), 0) / (library.length || 1)).toFixed(1)} color="from-green-500 to-emerald-500" />
        </div>
      )}

      <div className="bg-[#171a21] border border-[#2a475e] rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در کتابخانه..."
            className="w-full bg-[#0f1922] border border-[#2a475e] rounded-lg p-3 pr-10 focus:border-[#66c0f4] outline-none transition"
          />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className="bg-[#0f1922] border border-[#2a475e] rounded-lg p-3">
          <option value="newest">جدیدترین</option>
          <option value="oldest">قدیمی‌ترین</option>
          <option value="name">نام</option>
          <option value="rating">امتیاز</option>
        </select>
        <div className="flex gap-1 bg-[#0f1922] rounded-lg p-1">
          <button onClick={() => setView('grid')} className={`p-2 rounded ${view === 'grid' ? 'bg-[#66c0f4] text-[#171a21]' : 'text-gray-400'}`}>
            <Grid3x3 size={18} />
          </button>
          <button onClick={() => setView('list')} className={`p-2 rounded ${view === 'list' ? 'bg-[#66c0f4] text-[#171a21]' : 'text-gray-400'}`}>
            <List size={18} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-[#171a21] border border-[#2a475e] rounded-2xl">
          <Library size={64} className="mx-auto mb-4 opacity-30" />
          <div className="font-bold mb-2">کتابخانه‌ات خالیه!</div>
          <Link href="/games" className="text-[#66c0f4] hover:underline">رفتن به فروشگاه →</Link>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((g) => (
            <div key={g.id} className="group relative bg-[#171a21] border border-[#2a475e] rounded-xl overflow-hidden hover:border-[#66c0f4] transition hover:-translate-y-1">
              <Link href={`/games/${g.id}`} className="block">
                <div className="aspect-[3/4] bg-[#0f1922] relative overflow-hidden">
                  {g.coverImage ? (
                    <img src={g.coverImage} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🎮</div>
                  )}
                  {g.DLCs?.length > 0 && (
                    <div className="absolute top-2 right-2 bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                      +{g.DLCs.length} DLC
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-3">
                <h3 className="font-bold text-sm mb-1 truncate">{g.title}</h3>
                <div className="text-xs text-gray-500">{new Date(g.purchasedAt).toLocaleDateString('fa-IR')}</div>
                {!g.hasReview && <div className="text-xs text-yellow-500 mt-1">⭐ نظر ندادی</div>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((g) => (
            <Link key={g.id} href={`/games/${g.id}`} className="flex items-center gap-4 bg-[#171a21] border border-[#2a475e] rounded-xl p-3 hover:border-[#66c0f4] transition">
              <div className="w-16 h-20 bg-[#0f1922] rounded-lg overflow-hidden shrink-0">
                {g.coverImage ? <img src={g.coverImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🎮</div>}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{g.title}</h3>
                <div className="text-xs text-gray-500 mt-1">📅 {new Date(g.purchasedAt).toLocaleDateString('fa-IR')}</div>
                <div className="flex items-center gap-3 mt-1 text-xs">
                  <span className="text-yellow-500">⭐ {g.rating?.toFixed(1) || '0.0'}</span>
                  {g.DLCs?.length > 0 && <span className="text-purple-400">🎁 {g.DLCs.length} DLC</span>}
                </div>
              </div>
              <button className="bg-[#66c0f4] text-[#171a21] font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                <Play size={14} /> باز کردن
              </button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ Messages Tab ============ */
function TabMessages({ unreadCounts, setUnreadCounts }) {
  const [channel, setChannel] = useState('bot'); // bot | support
  const [botMessages, setBotMessages] = useState([]);
  const [botInput, setBotInput] = useState('');
  const [botLoading, setBotLoading] = useState(false);
  const [supportTicket, setSupportTicket] = useState(null);
  const [supportMessages, setSupportMessages] = useState([]);
  const [supportInput, setSupportInput] = useState('');
  const [supportLoading, setSupportLoading] = useState(false);
  const endRef = useRef();

  // بارگذاری ربات
  const loadBot = () => {
    api.get('/messages/bot/messages').then((r) => setBotMessages(r.data)).catch(() => {});
  };

  // بارگذاری پشتیبانی
  const loadSupport = () => {
    api.get('/messages/support').then((r) => {
      setSupportTicket(r.data.ticket);
      setSupportMessages(r.data.messages);
    }).catch(() => {});
  };

  useEffect(() => {
    if (channel === 'bot') loadBot();
    else loadSupport();
  }, [channel]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [botMessages, supportMessages, channel]);

  // Polling پشتیبانی
  useEffect(() => {
    if (channel !== 'support') return;
    const t = setInterval(loadSupport, 5000);
    return () => clearInterval(t);
  }, [channel]);

  const askBot = async () => {
    if (!botInput.trim()) return;
    const q = botInput;
    setBotInput('');
    setBotLoading(true);

    // اضافه کردن پیام کاربر
    setBotMessages(prev => [...prev, {
      id: 'user-' + Date.now(),
      type: 'user',
      content: q,
      createdAt: new Date()
    }]);

    try {
      const { data } = await api.post('/messages/bot/ask', { question: q });
      setBotMessages(prev => [...prev, {
        id: 'bot-' + Date.now(),
        type: 'bot',
        content: data.answer,
        createdAt: data.timestamp
      }]);
    } catch {
      setBotMessages(prev => [...prev, {
        id: 'err-' + Date.now(),
        type: 'bot',
        content: '❌ خطا در دریافت پاسخ',
        createdAt: new Date()
      }]);
    } finally {
      setBotLoading(false);
    }
  };

  const sendSupport = async () => {
    if (!supportInput.trim()) return;
    const msg = supportInput;
    setSupportInput('');
    setSupportLoading(true);

    try {
      const { data } = await api.post('/messages/support', { content: msg });
      setSupportMessages(prev => [...prev, data]);
      // مارک پیام‌های ادمین خوانده شده
      setUnreadCounts(prev => ({ ...prev, support: 0 }));
    } catch (e) {
      alert(e.response?.data?.error || 'خطا');
    } finally {
      setSupportLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* انتخاب کانال */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => setChannel('bot')}
          className={`p-4 rounded-2xl border-2 transition flex items-center gap-3 ${
            channel === 'bot'
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-[#2a475e] hover:border-purple-500/50'
          }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            channel === 'bot' ? 'bg-purple-500 text-white' : 'bg-[#2a475e] text-gray-400'
          }`}>
            <Bot size={24} />
          </div>
          <div className="flex-1 text-right">
            <div className="font-bold flex items-center gap-2">
              ربات هوشمند
              {unreadCounts.bot > 0 && (
                <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCounts.bot}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">اعلان‌ها و راهنما</div>
          </div>
        </button>

        <button
          onClick={() => setChannel('support')}
          className={`p-4 rounded-2xl border-2 transition flex items-center gap-3 ${
            channel === 'support'
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-[#2a475e] hover:border-blue-500/50'
          }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            channel === 'support' ? 'bg-blue-500 text-white' : 'bg-[#2a475e] text-gray-400'
          }`}>
            <Headphones size={24} />
          </div>
          <div className="flex-1 text-right">
            <div className="font-bold flex items-center gap-2">
              پشتیبانی
              {unreadCounts.support > 0 && (
                <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCounts.support}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">چت با ادمین</div>
          </div>
        </button>
      </div>

      {/* کانال */}
      <div className="bg-[#171a21] border border-[#2a475e] rounded-2xl overflow-hidden flex flex-col h-[600px]">
        {/* هدر */}
        <div className={`p-4 flex items-center gap-3 border-b border-[#2a475e] ${
          channel === 'bot' ? 'bg-purple-500/10' : 'bg-blue-500/10'
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            channel === 'bot' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'
          }`}>
            {channel === 'bot' ? <Bot size={20} /> : <Headphones size={20} />}
          </div>
          <div className="flex-1">
            <div className="font-bold">{channel === 'bot' ? 'ربات SteamClub' : 'پشتیبانی آنلاین'}</div>
            <div className="text-xs flex items-center gap-1 text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {channel === 'bot' ? 'فعال' : 'معمولاً تا ۵ دقیقه پاسخ'}
            </div>
          </div>
        </div>

        {/* بدنه */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {channel === 'bot' ? (
            <>
              {botMessages.map((m) => (
                <div key={m.id} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    m.type === 'user'
                      ? 'bg-[#66c0f4] text-[#171a21] rounded-br-sm'
                      : 'bg-[#2a475e] rounded-bl-sm'
                  }`}>
                    <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                  </div>
                </div>
              ))}
              {botLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#2a475e] p-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />

              {/* پیشنهادها */}
              {botMessages.length <= 1 && (
                <div className="pt-4">
                  <div className="text-xs text-gray-500 mb-2">سوالات پرتکرار:</div>
                  <div className="flex flex-wrap gap-2">
                    {['سفارشاتم چطوره؟', 'موجودی کیف پولم چقدره؟', 'کد تخفیف فعال چیه؟', 'کتابخانه کجاست؟'].map((q) => (
                      <button
                        key={q}
                        onClick={() => setBotInput(q)}
                        className="bg-[#2a475e] hover:bg-[#3a5a78] px-3 py-2 rounded-lg text-xs transition"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {supportMessages.length === 0 && (
                <div className="text-center py-10 text-gray-500 text-sm">در حال بارگذاری...</div>
              )}
              {supportMessages.map((m) => (
                <div key={m.id} className={`flex ${!m.isAdmin ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    !m.isAdmin
                      ? 'bg-[#66c0f4] text-[#171a21] rounded-br-sm'
                      : 'bg-[#2a475e] rounded-bl-sm'
                  }`}>
                    {m.isAdmin && (
                      <div className="text-xs opacity-70 mb-1 flex items-center gap-1">
                        <Headphones size={12} /> پشتیبانی
                      </div>
                    )}
                    <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                    <div className={`text-[10px] mt-1 opacity-60 ${!m.isAdmin ? 'text-left' : ''}`}>
                      {new Date(m.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-[#2a475e]">
          {channel === 'bot' ? (
            <div className="flex gap-2">
              <input
                value={botInput}
                onChange={(e) => setBotInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askBot()}
                placeholder="سوالت رو بنویس..."
                className="flex-1 bg-[#0f1922] border border-[#2a475e] rounded-xl p-3 text-sm focus:border-purple-500 outline-none transition"
              />
              <button
                onClick={askBot}
                disabled={!botInput.trim() || botLoading}
                className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-xl disabled:opacity-50 transition"
              >
                <Send size={18} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={supportInput}
                onChange={(e) => setSupportInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendSupport()}
                placeholder="پیام به پشتیبانی..."
                className="flex-1 bg-[#0f1922] border border-[#2a475e] rounded-xl p-3 text-sm focus:border-blue-500 outline-none transition"
              />
              <button
                onClick={sendSupport}
                disabled={!supportInput.trim() || supportLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl disabled:opacity-50 transition"
              >
                <Send size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============ بقیه تب‌ها (کوتاه شده) ============ */

function TabInfo({ user, form, setForm, uploadAvatar, saveInfo, uploadingAvatar }) {
  return (
    <div className="bg-[#171a21] border border-[#2a475e] rounded-2xl p-6 md:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-[#2a475e] mb-6">
        <FramedAvatar src={form.avatar} username={user.username} frameId="gold" size={96} />
        <div className="flex-1 text-center md:text-right">
          <div className="font-bold mb-2">تصویر پروفایل</div>
          <label className="cursor-pointer bg-[#2a475e] hover:bg-[#3a5a78] px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2 transition">
            <Camera size={14} /> {uploadingAvatar ? 'در حال آپلود...' : 'انتخاب عکس'}
            <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
          </label>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="نام کاربری" icon={<User size={14} />}>
          <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </Field>
        <Field label="ایمیل" icon={<Mail size={14} />} hint="قابل تغییر نیست">
          <Input value={user.email} disabled className="opacity-50" />
        </Field>
        <Field label="موبایل" icon={<Phone size={14} />}>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="09xxxxxxxxx" />
        </Field>
        <Field label="تاریخ عضویت" icon={<Calendar size={14} />}>
          <Input value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('fa-IR') : '-'} disabled className="opacity-50" />
        </Field>
        <div className="md:col-span-2">
          <Field label="درباره من">
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3}
              className="w-full bg-[#0f1922] border border-[#2a475e] rounded-lg p-3 focus:border-[#66c0f4] outline-none text-white" />
          </Field>
        </div>
      </div>
      <button onClick={saveInfo} className="mt-6 bg-[#66c0f4] text-[#171a21] font-bold px-6 py-3 rounded-lg hover:bg-[#4fa8d8] flex items-center gap-2 transition">
        <Save size={16} /> ذخیره
      </button>
    </div>
  );
}

function TabStats({ stats }) {
  const COLORS = ['#66c0f4', '#f39c12', '#e74c3c', '#2ecc71', '#9b59b6'];
  const pieData = (stats.topGenres || []).map((g) => ({ name: g.name, value: g.count }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="🛍️" label="کل سفارشات" value={stats.totalOrders} color="from-blue-500 to-cyan-500" />
        <StatCard icon="✅" label="تکمیل" value={stats.completedOrders} color="from-green-500 to-emerald-500" />
        <StatCard icon="⏳" label="در جریان" value={stats.pendingOrders} color="from-yellow-500 to-orange-500" />
        <StatCard icon="💰" label="کل خرید" value={Number(stats.totalSpent).toLocaleString('en-US')} color="from-purple-500 to-pink-500" />
      </div>

      <div className="bg-[#171a21] border border-[#2a475e] rounded-2xl p-6">
        <h3 className="font-bold mb-4">📈 روند خرید ۶ ماه اخیر</h3>
        {stats.monthlyOrders?.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stats.monthlyOrders}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#66c0f4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#66c0f4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ background: '#171a21', border: '1px solid #2a475e' }} />
              <Area type="monotone" dataKey="count" stroke="#66c0f4" strokeWidth={3} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-10 text-gray-500">هنوز خریدی نداری</div>
        )}
      </div>

      {pieData.length > 0 && (
        <div className="bg-[#171a21] border border-[#2a475e] rounded-2xl p-6">
          <h3 className="font-bold mb-4">🎯 ژانرهای مورد علاقه</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#171a21', border: '1px solid #2a475e' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {stats.topGenres.map((g, i) => (
                <div key={i} className="flex items-center justify-between bg-[#0f1922] rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span>{g.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{g.count} بازی</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabWallet({ user, transactions, chargeAmount, setChargeAmount, chargeWallet, charging }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-l from-[#66c0f4] to-[#2a475e] rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 text-sm opacity-80 mb-2"><Wallet size={16} /> موجودی</div>
          <div className="text-5xl font-bold">
            {(user.wallet || 0).toLocaleString('en-US')}
            <span className="text-xl font-normal mr-3">تومان</span>
          </div>
        </div>
      </div>

      <div className="bg-[#171a21] border border-[#2a475e] rounded-2xl p-6">
        <h3 className="font-bold mb-4">💰 شارژ کیف پول</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {[50000, 100000, 200000, 500000].map((amt) => (
            <button key={amt} onClick={() => setChargeAmount(amt)}
              className={`p-3 rounded-lg border-2 transition text-sm font-bold ${
                chargeAmount === amt ? 'border-[#66c0f4] bg-[#66c0f4]/10 text-[#66c0f4]' : 'border-[#2a475e] hover:border-[#66c0f4]/50'
              }`}>
              {amt.toLocaleString('en-US')}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input type="number" value={chargeAmount} onChange={(e) => setChargeAmount(+e.target.value)} />
          <button onClick={chargeWallet} disabled={charging}
            className="bg-[#66c0f4] text-[#171a21] font-bold px-8 rounded-lg hover:bg-[#4fa8d8] disabled:opacity-50">
            {charging ? '...' : 'شارژ'}
          </button>
        </div>
      </div>

      <div className="bg-[#171a21] border border-[#2a475e] rounded-2xl p-6">
        <h3 className="font-bold mb-4">📊 تاریخچه</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">تراکنشی نیست</div>
        ) : (
          <div className="space-y-2">
            {transactions.map((t) => {
              const isDeposit = t.type === 'deposit';
              return (
                <div key={t.id} className="flex items-center justify-between bg-[#0f1922] rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isDeposit ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {isDeposit ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    </div>
                    <div>
                      <div className="text-sm">{t.description || t.type}</div>
                      <div className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleString('fa-IR')}</div>
                    </div>
                  </div>
                  <div className={`font-bold ${isDeposit ? 'text-green-400' : 'text-red-400'}`}>
                    {isDeposit ? '+' : ''}{Math.abs(t.amount).toLocaleString('en-US')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function TabReviews({ reviews }) {
  return (
    <div className="animate-fade-in">
      <h3 className="font-bold mb-4">💬 نظرات من ({reviews.length})</h3>
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-[#171a21] border border-[#2a475e] rounded-2xl">
          <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
          هنوز نظری ندادی
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-[#171a21] border border-[#2a475e] rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <Link href={`/games/${r.Game?.id}`} className="w-12 h-16 bg-[#0f1922] rounded overflow-hidden">
                  {r.Game?.coverImage && <img src={r.Game.coverImage} className="w-full h-full object-cover" />}
                </Link>
                <div className="flex-1">
                  <Link href={`/games/${r.Game?.id}`} className="font-bold hover:text-[#66c0f4]">{r.Game?.title}</Link>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} className={s <= r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString('fa-IR')}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabAchievements({ achievements }) {
  const unlocked = achievements.filter((a) => a.unlocked).length;
  const percent = achievements.length ? (unlocked / achievements.length) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-l from-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm opacity-90">دستاوردها</div>
            <div className="text-3xl font-bold">{unlocked} از {achievements.length}</div>
          </div>
          <div className="text-6xl animate-float">🏆</div>
        </div>
        <div className="h-3 bg-black/20 rounded-full overflow-hidden">
          <div className="h-full bg-white transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {achievements.map((a) => <AchievementCard key={a.id} a={a} />)}
      </div>
    </div>
  );
}

function TabLoyalty({ loyalty, setUser, user }) {
  const redeem = async () => {
    try {
      const { data } = await api.post('/loyalty/redeem-cashback');
      setUser({ ...user, wallet: user.wallet + data.cashback });
      toast(`${data.cashback.toLocaleString('en-US')} اضافه شد`, 'success');
      setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
      toast(e.response?.data?.error || 'خطا', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className={`bg-gradient-to-l ${loyalty.levelColor || 'from-orange-700 to-orange-500'} rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full" />
        </div>
        <div className="relative">
          <div className="text-sm opacity-80 mb-1">سطح شما</div>
          <div className="text-5xl font-bold mb-2 flex items-center gap-3">
            <span className="text-6xl animate-float">{loyalty.levelIcon}</span> {loyalty.level}
          </div>
          {loyalty.nextLevel && loyalty.neededForNext > 0 && (
            <div className="mt-4">
              <div className="text-sm opacity-90 mb-2">{loyalty.neededForNext} خرید تا {loyalty.nextLevel}</div>
              <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all" style={{ width: `${(loyalty.completedOrders / (loyalty.completedOrders + loyalty.neededForNext)) * 100}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="🛍️" label="خرید" value={loyalty.completedOrders} color="from-blue-500 to-cyan-500" />
        <StatCard icon="💎" label="امتیاز" value={loyalty.points} color="from-purple-500 to-pink-500" />
        <StatCard icon="💬" label="نظر" value={loyalty.reviewCount} color="from-green-500 to-emerald-500" />
        <StatCard icon="💰" label="کل خرید" value={Number(loyalty.totalSpent).toLocaleString('en-US')} color="from-yellow-500 to-orange-500" />
      </div>
      <div className="bg-[#171a21] border border-[#2a475e] rounded-2xl p-6">
        <h3 className="font-bold mb-4">💸 کش‌بک</h3>
        <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-xl p-5">
          <div>
            <div className="text-sm text-gray-400">قابل دریافت</div>
            <div className="text-3xl font-bold text-green-400">
              {Number(loyalty.cashback).toLocaleString('en-US')}
              <span className="text-sm text-gray-400 mr-2">تومان</span>
            </div>
          </div>
          <button onClick={redeem} disabled={loyalty.cashback < 1000}
            className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-lg disabled:opacity-50">
            دریافت
          </button>
        </div>
      </div>
    </div>
  );
}

function TabSecurity({ pass, setPass, savePassword, sessions }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-[#171a21] border border-[#2a475e] rounded-2xl p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Lock className="text-[#66c0f4]" /> تغییر پسورد</h3>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-sm text-yellow-200 mb-5 flex gap-2">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <div>حداقل ۶ کاراکتر با حروف و اعداد</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="پسورد فعلی"><Input type="password" value={pass.current} onChange={(e) => setPass({ ...pass, current: e.target.value })} /></Field>
          <Field label="جدید"><Input type="password" value={pass.newPassword} onChange={(e) => setPass({ ...pass, newPassword: e.target.value })} /></Field>
          <Field label="تکرار"><Input type="password" value={pass.confirm} onChange={(e) => setPass({ ...pass, confirm: e.target.value })} /></Field>
        </div>
        <button onClick={savePassword} className="mt-5 bg-[#66c0f4] text-[#171a21] font-bold px-6 py-3 rounded-lg hover:bg-[#4fa8d8] flex items-center gap-2">
          <Lock size={16} /> تغییر
        </button>
      </div>
      <div className="bg-[#171a21] border border-[#2a475e] rounded-2xl p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Activity className="text-[#66c0f4]" /> ورودهای اخیر</h3>
        {sessions.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">اطلاعاتی نیست</div>
        ) : (
          <div className="space-y-2">
            {sessions.map((s, i) => (
              <div key={i} className="flex items-center justify-between bg-[#0f1922] rounded-lg p-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                    <CheckCircle size={14} />
                  </div>
                  <div>
                    <div>ورود موفق</div>
                    <div className="text-xs text-gray-500">{new Date(s.createdAt).toLocaleString('fa-IR')}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 font-mono">{s.ip || '—'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TabSettings({ exportData, showDelete, setShowDelete, deletePassword, setDeletePassword, deleteAccount }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-[#171a21] border border-[#2a475e] rounded-2xl p-6">
        <h3 className="font-bold mb-3 flex items-center gap-2"><Download className="text-[#66c0f4]" /> دانلود اطلاعات</h3>
        <button onClick={exportData} className="bg-[#2a475e] hover:bg-[#3a5a78] px-6 py-3 rounded-lg flex items-center gap-2">
          <Download size={16} /> دانلود JSON
        </button>
      </div>
      <div className="bg-red-900/10 border border-red-500/30 rounded-2xl p-6">
        <h3 className="font-bold mb-3 flex items-center gap-2 text-red-400"><Trash2 /> منطقه خطر</h3>
        {!showDelete ? (
          <button onClick={() => setShowDelete(true)} className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg flex items-center gap-2">
            <Trash2 size={16} /> حذف حساب
          </button>
        ) : (
          <div className="space-y-3">
            <Input type="password" placeholder="پسورد" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={deleteAccount} className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg">تایید</button>
              <button onClick={() => { setShowDelete(false); setDeletePassword(''); }} className="bg-[#2a475e] px-6 py-3 rounded-lg">انصراف</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}