'use client';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import {
  Search, User, LogOut, Gamepad2, Heart, Bell, Package,
  Megaphone, Settings, Sun, Moon, Menu, X, Home, HelpCircle
} from 'lucide-react';
import { getUser, logout } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import api from '@/lib/api';

export default function Header() {
  const { theme, toggle } = useTheme();
  const [user, setUser] = useState(null);
  const [q, setQ] = useState('');
  const [userMenu, setUserMenu] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [wishCount, setWishCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef();
  const notifRef = useRef();

  useEffect(() => {
    setUser(getUser());
    if (getUser()) {
      api.get('/wishlist').then((r) => setWishCount(r.data.length)).catch(() => {});
      api.get('/notifications').then((r) => setNotifs(r.data)).catch(() => {});
    }

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const click = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', click);
    return () => document.removeEventListener('mousedown', click);
  }, []);

  const search = (e) => {
    e.preventDefault();
    if (q.trim()) window.location.href = `/games?q=${encodeURIComponent(q)}`;
  };

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  const navLinks = [
    { href: '/', label: 'خانه', icon: Home },
    { href: '/games', label: 'بازی‌ها', icon: Gamepad2 },
    { href: '/about', label: 'درباره ما', icon: User },
    { href: '/faq', label: 'سوالات', icon: HelpCircle },
    { href: '/advertise', label: 'تبلیغات', icon: Megaphone },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#171a21]/95 backdrop-blur-lg shadow-lg shadow-black/30'
            : 'bg-[#171a21] border-b border-[#2a475e]'
        }`}
      >
        <div className="container mx-auto px-4 h-16 flex items-center gap-2 md:gap-4">
          {/* منوی موبایل */}
          <button
            onClick={() => setMobileMenu(true)}
            className="lg:hidden p-2 hover:bg-[#2a475e] rounded-lg"
          >
            <Menu size={22} />
          </button>

          {/* لوگو */}
          <Link href="/" className="flex items-center gap-2 text-[#66c0f4] font-bold text-xl shrink-0 hover:scale-105 transition">
            <Gamepad2 size={28} />
            <span className="hidden sm:inline">IranSteam</span>
          </Link>

          {/* ناوبری دسکتاپ */}
          <nav className="hidden lg:flex gap-5 text-sm shrink-0">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:text-[#66c0f4] transition relative group flex items-center gap-1"
              >
                {l.label}
                <span className="absolute -bottom-1 right-0 w-0 h-0.5 bg-[#66c0f4] group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* جستجو دسکتاپ */}
          <form onSubmit={search} className="flex-1 max-w-md hidden md:block">
            <div className="relative group">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#66c0f4] transition" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="جستجوی بازی..."
                className="w-full bg-[#316282] text-white placeholder-white/60 rounded-full py-2 pr-10 pl-4 text-sm outline-none focus:bg-[#407a9e] transition"
              />
            </div>
          </form>

          <div className="flex items-center gap-1 mr-auto">
            {/* تم */}
            <button
              onClick={toggle}
              className="p-2 hover:bg-[#2a475e] rounded-lg transition"
              title={theme === 'dark' ? 'حالت روشن' : 'حالت تاریک'}
            >
              {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-500" />}
            </button>

            {user ? (
              <>
                <Link href="/wishlist" className="relative p-2 hover:bg-[#2a475e] rounded-lg transition">
                  <Heart size={20} />
                  {wishCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                      {wishCount}
                    </span>
                  )}
                </Link>

                <div className="relative hidden md:block" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 hover:bg-[#2a475e] rounded-lg transition"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute left-0 top-12 w-80 bg-[#171a21] border border-[#2a475e] rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto animate-fade-in">
                      <div className="p-3 border-b border-[#2a475e] font-bold text-sm">اعلان‌ها</div>
                      {notifs.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">اعلانی نیست</div>
                      ) : (
                        notifs.slice(0, 10).map((n) => (
                          <div key={n.id} className={`p-3 border-b border-[#2a475e] hover:bg-[#2a475e] cursor-pointer ${!n.isRead ? 'bg-[#66c0f4]/5' : ''}`}>
                            <div className="font-bold text-sm">{n.title}</div>
                            <div className="text-xs text-gray-400 mt-1">{n.body}</div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setUserMenu(!userMenu)}
                    className="flex items-center gap-2 hover:bg-[#2a475e] p-1 rounded-lg transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#66c0f4] to-[#2a475e] text-[#171a21] flex items-center justify-center font-bold shadow-lg overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt={user.username} />
                      ) : (
                        user.username[0].toUpperCase()
                      )}
                    </div>
                  </button>

                  {userMenu && (
                    <div className="absolute left-0 top-12 w-56 bg-[#171a21] border border-[#2a475e] rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                      <div className="p-4 border-b border-[#2a475e] bg-gradient-to-l from-[#66c0f4]/10 to-transparent">
                        <div className="font-bold">{user.username}</div>
                        <div className="text-xs text-gray-500 mt-0.5">خوش آمدی 👋</div>
                      </div>
                      <Link href="/profile" onClick={() => setUserMenu(false)} className="block px-4 py-3 hover:bg-[#2a475e] text-sm transition flex items-center gap-3">
                        <User size={16} /> پروفایل من
                      </Link>
                      <Link href="/orders" onClick={() => setUserMenu(false)} className="block px-4 py-3 hover:bg-[#2a475e] text-sm transition flex items-center gap-3">
                        <Package size={16} /> سفارشات من
                      </Link>
                      <Link href="/wishlist" onClick={() => setUserMenu(false)} className="block px-4 py-3 hover:bg-[#2a475e] text-sm transition flex items-center gap-3">
                        <Heart size={16} /> علاقه‌مندی‌ها
                      </Link>
                      <Link href="/advertise" onClick={() => setUserMenu(false)} className="block px-4 py-3 hover:bg-[#2a475e] text-sm transition flex items-center gap-3">
                        <Megaphone size={16} /> رزرو تبلیغات
                      </Link>
                      {user.role === 'admin' && (
                        <a href="http://localhost:5173" className="block px-4 py-3 hover:bg-[#2a475e] text-sm text-yellow-400 transition flex items-center gap-3">
                          <Settings size={16} /> پنل ادمین
                        </a>
                      )}
                      <button onClick={logout} className="w-full text-right px-4 py-3 hover:bg-red-900/30 text-sm text-red-400 border-t border-[#2a475e] transition flex items-center gap-3">
                        <LogOut size={16} /> خروج
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm hover:text-[#66c0f4] px-2 md:px-3 py-2 transition">
                  ورود
                </Link>
                <Link href="/register" className="bg-[#66c0f4] text-[#171a21] text-sm px-3 md:px-4 py-2 rounded-lg font-bold hover:bg-[#4fa8d8] transition">
                  ثبت‌نام
                </Link>
              </>
            )}
          </div>
        </div>

        {/* جستجوی موبایل */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={search}>
            <div className="relative">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="جستجو..."
                className="w-full bg-[#316282] text-white placeholder-white/60 rounded-full py-2 pr-10 pl-4 text-sm outline-none"
              />
            </div>
          </form>
        </div>
      </header>

      {/* 📱 منوی کشویی موبایل */}
      {mobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileMenu(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-[#171a21] border-l border-[#2a475e] p-4 animate-slide-in">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#2a475e]">
              <div className="flex items-center gap-2 text-[#66c0f4] font-bold text-xl">
                <Gamepad2 size={24} /> IranSteam
              </div>
              <button onClick={() => setMobileMenu(false)} className="p-2 hover:bg-[#2a475e] rounded-lg">
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-1">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#2a475e] transition"
                >
                  <l.icon size={18} />
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="mt-6 pt-6 border-t border-[#2a475e]">
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#2a475e] transition">
                    <User size={18} /> پروفایل
                  </Link>
                  <Link href="/orders" onClick={() => setMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#2a475e] transition">
                    <Package size={18} /> سفارشات
                  </Link>
                  <Link href="/wishlist" onClick={() => setMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#2a475e] transition">
                    <Heart size={18} /> علاقه‌مندی‌ها
                  </Link>
                  <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-900/30 text-red-400 transition text-right">
                    <LogOut size={18} /> خروج
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link href="/login" onClick={() => setMobileMenu(false)} className="block text-center px-4 py-3 rounded-lg border border-[#2a475e] hover:border-[#66c0f4] transition">
                    ورود
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenu(false)} className="block text-center px-4 py-3 rounded-lg bg-[#66c0f4] text-[#171a21] font-bold transition">
                    ثبت‌نام
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}