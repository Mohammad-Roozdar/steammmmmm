import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../api';
import {
  LayoutDashboard, ShoppingBag, Gamepad2, Users, MessageSquare,
  Headphones, Globe, Settings, LogOut, Bell, Megaphone, Ticket
} from 'lucide-react';
import { FileSpreadsheet } from 'lucide-react';

const items = [
  { to: '/', icon: LayoutDashboard, label: 'داشبورد' },
  { to: '/orders', icon: ShoppingBag, label: 'سفارشات' },
  { to: '/games', icon: Gamepad2, label: 'بازی‌ها' },
  { to: '/users', icon: Users, label: 'کاربران' },
  { to: '/billboards', icon: Megaphone, label: 'بیلبوردها' },
  { to: '/coupons', icon: Ticket, label: 'کد تخفیف' },
  { to: '/tickets', icon: MessageSquare, label: 'تیکت‌ها' },
  { to: '/live-chat', icon: Headphones, label: 'چت آنلاین' },
  { to: '/regions', icon: Globe, label: 'ریجن‌ها' },
  { to: '/reports', icon: FileSpreadsheet, label: 'گزارش‌گیری' },
  { to: '/settings', icon: Settings, label: 'تنظیمات' },
];

export default function Layout() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [chatCount, setChatCount] = useState(0);

  useEffect(() => {
    const socket = io('http://localhost:5000/chat');
    socket.emit('admin:join');
    socket.on('chat:new', () => setChatCount(c => c + 1));
    socket.on('chat:update', (chat) => {
      if (chat.unreadAdmin > 0) setChatCount(c => c + 1);
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    api.get('/notifications').then(r => setNotifs(r.data)).catch(() => {});
    const t = setInterval(() => {
      api.get('/notifications').then(r => setNotifs(r.data)).catch(() => {});
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const logout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen" dir="rtl">
      <aside className="w-64 bg-[#171a21] border-l border-[#2a475e] flex flex-col">
        <div className="p-6 border-b border-[#2a475e]">
          <h1 className="text-2xl font-bold text-[#66c0f4]">🎮 SteamClub</h1>
          <p className="text-xs text-gray-500 mt-1">پنل مدیریت</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {items.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm ${
                  isActive ? 'bg-[#66c0f4] text-[#0f1922] font-bold' : 'hover:bg-[#2a475e]'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === 'چت آنلاین' && chatCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 rounded-full mr-auto">
                  {chatCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="m-4 flex items-center gap-3 px-4 py-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 transition"
        >
          <LogOut size={18} /> خروج
        </button>
      </aside>

      <main className="flex-1 bg-[#0f1922]">
        <header className="h-16 bg-[#171a21] border-b border-[#2a475e] flex items-center justify-between px-6 sticky top-0 z-30">
          <h2 className="font-bold">پنل مدیریت SteamClub</h2>
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 hover:bg-[#2a475e] rounded-lg"
            >
              <Bell size={20} />
              {notifs.filter(n => !n.isRead).length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            {showNotifs && (
              <div className="absolute left-0 top-12 w-80 bg-[#171a21] border border-[#2a475e] rounded-lg shadow-xl z-50 max-h-96 overflow-auto">
                {notifs.slice(0, 10).map(n => (
                  <div key={n.id} className="p-3 border-b border-[#2a475e] hover:bg-[#2a475e] cursor-pointer">
                    <div className="font-bold text-sm">{n.title}</div>
                    <div className="text-xs text-gray-400">{n.body}</div>
                  </div>
                ))}
                {notifs.length === 0 && (
                  <div className="p-4 text-center text-gray-500">نوتیفی نیست</div>
                )}
              </div>
            )}
          </div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}