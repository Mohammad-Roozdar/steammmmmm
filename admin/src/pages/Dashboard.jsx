import { useEffect, useState } from 'react';
import api from '../api';
import {
  ShoppingBag, Users, Gamepad2, DollarSign, Clock, MessageSquare,
  TrendingUp, TrendingDown, Zap, UserPlus, Eye, Gift, Package
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats').then(r => {
      setData(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="text-center py-20">
      <div className="animate-spin w-12 h-12 border-4 border-[#66c0f4] border-t-transparent rounded-full mx-auto mb-4" />
      <div className="text-gray-500">در حال بارگذاری...</div>
    </div>
  );

  if (!data) return <div className="text-center py-20 text-red-400">خطا در بارگذاری</div>;

  const c = data.cards;
  const COLORS = ['#66c0f4', '#f39c12', '#2ecc71', '#e74c3c', '#9b59b6', '#1abc9c', '#e67e22'];

  const statusLabels = {
    pending_payment: 'در انتظار پرداخت',
    paid: 'پرداخت شده',
    in_progress: 'در حال انجام',
    completed: 'تکمیل شده',
    failed: 'ناموفق',
    refunded: 'مرجوعی'
  };

  const statusData = data.orderStatus.map(s => ({
    name: statusLabels[s.status] || s.status,
    value: parseInt(s.count)
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">📊 داشبورد</h1>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-3 py-1.5 rounded-lg text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {c.onlineUsers} کاربر آنلاین
          </div>
        </div>
      </div>

      {/* 📈 کارت‌های آمار */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard icon={<Users />} label="کاربران" value={c.totalUsers} color="from-blue-500 to-cyan-500" />
        <StatCard icon={<ShoppingBag />} label="سفارشات" value={c.totalOrders} color="from-purple-500 to-pink-500" />
        <StatCard icon={<Gamepad2 />} label="بازی‌ها" value={c.totalGames} color="from-green-500 to-emerald-500" />
        <StatCard icon={<Gift />} label="DLCها" value={c.totalDLCs} color="from-orange-500 to-yellow-500" />
        <StatCard icon={<Clock />} label="در انتظار" value={c.pendingOrders} color="from-red-500 to-pink-500" />
        <StatCard icon={<MessageSquare />} label="تیکت باز" value={c.openTickets} color="from-indigo-500 to-purple-500" />
      </div>

      {/* 💰 درآمد */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MoneyCard
          icon={<DollarSign />}
          label="درآمد کل"
          value={c.totalRevenue}
          color="from-green-500 to-emerald-500"
          big
        />
        <MoneyCard
          icon={<TrendingUp />}
          label="درآمد امروز"
          value={c.todayRevenue}
          color="from-blue-500 to-cyan-500"
        />
        <MoneyCard
          icon={<TrendingUp />}
          label="درآمد هفته"
          value={c.weekRevenue}
          color="from-purple-500 to-pink-500"
        />
      </div>

      {/* 📊 نمودارها */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="📈 فروش هفته اخیر" icon={<TrendingUp className="text-[#66c0f4]" />}>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.salesChart}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#66c0f4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#66c0f4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ background: '#171a21', border: '1px solid #2a475e', borderRadius: 8 }} />
              <Area type="monotone" dataKey="count" stroke="#66c0f4" strokeWidth={3} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="👥 کاربران جدید" icon={<UserPlus className="text-green-500" />}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.usersChart}>
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ background: '#171a21', border: '1px solid #2a475e', borderRadius: 8 }} />
              <Line type="monotone" dataKey="count" stroke="#2ecc71" strokeWidth={3} dot={{ fill: '#2ecc71', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 🥧 توزیع وضعیت سفارشات */}
        <ChartCard title="📦 وضعیت سفارشات">
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#171a21', border: '1px solid #2a475e' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10 text-gray-500">اطلاعاتی نیست</div>
          )}
        </ChartCard>

        {/* 🏆 پرفروش‌ترین‌ها */}
        <ChartCard title="🏆 پرفروش‌ترین‌ها">
          <div className="space-y-3">
            {data.topGames.length === 0 ? (
              <div className="text-center py-10 text-gray-500">اطلاعاتی نیست</div>
            ) : (
              data.topGames.map((g, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    i === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                    i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                    i === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                    'bg-[#2a475e]'
                  }`}>
                    #{i + 1}
                  </div>
                  <div className="w-10 h-12 rounded overflow-hidden shrink-0">
                    {g.Game?.coverImage ? (
                      <img src={g.Game.coverImage} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">🎮</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate">{g.Game?.title}</div>
                    <div className="text-xs text-gray-500">{g.sales} فروش</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ChartCard>

        {/* 📦 آخرین سفارشات */}
        <ChartCard title="📦 آخرین سفارشات">
          <div className="space-y-2">
            {data.recentOrders.length === 0 ? (
              <div className="text-center py-10 text-gray-500">اطلاعاتی نیست</div>
            ) : (
              data.recentOrders.map((o) => (
                <div key={o.id} className="flex items-center gap-2 p-2 bg-[#0f1922] rounded-lg text-sm">
                  <Package size={16} className="text-[#66c0f4] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{o.Game?.title || 'DLC'}</div>
                    <div className="text-xs text-gray-500">{o.User?.username}</div>
                  </div>
                  <div className="text-xs text-[#66c0f4] shrink-0">
                    {(o.finalPrice || 0).toLocaleString('en-US')}
                  </div>
                </div>
              ))
            )}
          </div>
        </ChartCard>
      </div>

      {/* 👥 آخرین کاربران */}
      <ChartCard title="👥 آخرین کاربران ثبت‌نام‌شده">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {data.recentUsers.map((u) => (
            <div key={u.id} className="bg-[#0f1922] rounded-lg p-3 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-[#66c0f4] to-[#2a475e] flex items-center justify-center overflow-hidden mb-2">
                {u.avatar ? (
                  <img src={u.avatar} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-white">{u.username[0].toUpperCase()}</span>
                )}
              </div>
              <div className="text-sm font-bold truncate">{u.username}</div>
              <div className="text-xs text-gray-500 truncate">{u.email}</div>
              <div className="text-[10px] text-gray-600 mt-1">
                {new Date(u.createdAt).toLocaleDateString('fa-IR')}
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-4 text-white shadow-lg hover:scale-105 transition`}>
      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-2">
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs opacity-90">{label}</div>
    </div>
  );
}

function MoneyCard({ icon, label, value, color, big }) {
  return (
    <div className={`bg-gradient-to-l ${color} rounded-2xl p-6 text-white shadow-xl relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-full" />
      </div>
      <div className="relative">
        <div className="flex items-center gap-2 text-sm opacity-90 mb-2">
          {icon} {label}
        </div>
        <div className={`${big ? 'text-4xl' : 'text-2xl'} font-bold`}>
          {Number(value).toLocaleString('en-US')}
        </div>
        <div className="text-xs opacity-70 mt-1">تومان</div>
      </div>
    </div>
  );
}

function ChartCard({ title, icon, children }) {
  return (
    <div className="bg-[#171a21] border border-[#2a475e] rounded-2xl p-6">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}