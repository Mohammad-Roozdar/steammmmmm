import { useEffect, useState } from 'react';
import api from '../api';
import {
  Download, Calendar, Filter, TrendingUp, Users, Gamepad2,
  DollarSign, Package, Gift, BarChart3, FileSpreadsheet
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

const COLORS = ['#66c0f4', '#f39c12', '#2ecc71', '#e74c3c', '#9b59b6', '#1abc9c'];

export default function Reports() {
  const [tab, setTab] = useState('sales');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState('all');

  const loadSales = () => {
    setLoading(true);
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    if (status !== 'all') params.status = status;

    api.get('/reports/sales', { params }).then(r => {
      setData(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const loadUsers = () => {
    setLoading(true);
    api.get('/reports/users').then(r => {
      setData({ users: r.data });
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const loadGames = () => {
    setLoading(true);
    api.get('/reports/games').then(r => {
      setData({ games: r.data });
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const loadTransactions = () => {
    setLoading(true);
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;

    api.get('/reports/transactions', { params }).then(r => {
      setData(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    if (tab === 'sales') loadSales();
    else if (tab === 'users') loadUsers();
    else if (tab === 'games') loadGames();
    else if (tab === 'transactions') loadTransactions();
  }, [tab]);

  const downloadExcel = (type) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (status !== 'all' && type === 'sales') params.append('status', status);

    const url = `http://localhost:5000/api/reports/${type}/excel?${params.toString()}`;
    const token = localStorage.getItem('admin_token');

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${type}-${Date.now()}.xlsx`;
        a.click();
      })
      .catch(() => alert('خطا در دانلود'));
  };

  const tabs = [
    { id: 'sales', label: '📊 فروش', icon: TrendingUp },
    { id: 'transactions', label: '💰 تراکنش‌ها', icon: DollarSign },
    { id: 'users', label: '👥 کاربران', icon: Users },
    { id: 'games', label: '🎮 بازی‌ها', icon: Gamepad2 }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">📊 گزارش‌گیری</h1>
      </div>

      {/* تب‌ها */}
      <div className="flex gap-2 flex-wrap bg-[#171a21] p-2 rounded-xl border border-[#2a475e]">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 rounded-lg text-sm transition flex items-center gap-2 ${
              tab === t.id ? 'bg-[#66c0f4] text-[#0f1922] font-bold' : 'hover:bg-[#2a475e]'
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* فیلترها */}
      {(tab === 'sales' || tab === 'transactions') && (
        <div className="bg-[#171a21] p-4 rounded-xl border border-[#2a475e] flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-gray-400 block mb-1">از تاریخ</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="bg-[#0f1922] border border-[#2a475e] rounded-lg p-2"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">تا تاریخ</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bg-[#0f1922] border border-[#2a475e] rounded-lg p-2"
            />
          </div>
          {tab === 'sales' && (
            <div>
              <label className="text-xs text-gray-400 block mb-1">وضعیت</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-[#0f1922] border border-[#2a475e] rounded-lg p-2"
              >
                <option value="all">همه</option>
                <option value="pending_payment">در انتظار پرداخت</option>
                <option value="paid">پرداخت شده</option>
                <option value="in_progress">در حال انجام</option>
                <option value="completed">تکمیل شده</option>
                <option value="failed">ناموفق</option>
                <option value="refunded">مرجوعی</option>
              </select>
            </div>
          )}
          <button
            onClick={() => tab === 'sales' ? loadSales() : loadTransactions()}
            className="bg-[#66c0f4] text-[#0f1922] font-bold px-5 py-2 rounded-lg flex items-center gap-2"
          >
            <Filter size={16} /> اعمال فیلتر
          </button>
          <button
            onClick={() => downloadExcel(tab)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2 rounded-lg flex items-center gap-2 ml-auto"
          >
            <FileSpreadsheet size={16} /> دانلود Excel
          </button>
        </div>
      )}

      {tab === 'users' && (
        <div className="flex justify-end">
          <button
            onClick={() => downloadExcel('users')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2 rounded-lg flex items-center gap-2"
          >
            <FileSpreadsheet size={16} /> دانلود Excel
          </button>
        </div>
      )}

      {tab === 'games' && (
        <div className="flex justify-end">
          <button
            onClick={() => downloadExcel('games')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2 rounded-lg flex items-center gap-2"
          >
            <FileSpreadsheet size={16} /> دانلود Excel
          </button>
        </div>
      )}

      {/* محتوا */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-12 h-12 border-4 border-[#66c0f4] border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <>
          {tab === 'sales' && data?.summary && (
            <SalesReport data={data} />
          )}
          {tab === 'transactions' && data?.summary && (
            <TransactionsReport data={data} />
          )}
          {tab === 'users' && data?.users && (
            <UsersReport users={data.users} />
          )}
          {tab === 'games' && data?.games && (
            <GamesReport games={data.games} />
          )}
        </>
      )}
    </div>
  );
}

function SalesReport({ data }) {
  const { orders, summary } = data;

  const statusLabels = {
    pending_payment: 'در انتظار پرداخت',
    paid: 'پرداخت شده',
    in_progress: 'در حال انجام',
    completed: 'تکمیل شده',
    failed: 'ناموفق',
    refunded: 'مرجوعی',
    cancelled: 'لغو شده'
  };

  const byDayData = Object.entries(summary.byDay)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, total]) => ({ date, total }));

  const byStatusData = Object.entries(summary.byStatus).map(([k, v]) => ({
    name: statusLabels[k] || k,
    value: v
  }));

  const byRegionData = Object.entries(summary.byRegion)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-4">
      {/* کارت‌های آمار */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox icon="🛒" label="کل سفارشات" value={summary.totalOrders} color="from-blue-500 to-cyan-500" />
        <StatBox icon="💰" label="کل درآمد" value={Number(summary.totalRevenue).toLocaleString('en-US')} color="from-green-500 to-emerald-500" />
        <StatBox icon="🎁" label="کل تخفیف" value={Number(summary.totalDiscount).toLocaleString('en-US')} color="from-yellow-500 to-orange-500" />
        <StatBox icon="✅" label="تکمیل شده" value={summary.completed} color="from-purple-500 to-pink-500" />
      </div>

      {/* نمودارها */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartBox title="📈 فروش روزانه">
          {byDayData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byDayData}>
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{ background: '#171a21', border: '1px solid #2a475e' }}
                  formatter={(v) => Number(v).toLocaleString('en-US')}
                />
                <Bar dataKey="total" fill="#66c0f4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10 text-gray-500">اطلاعاتی نیست</div>
          )}
        </ChartBox>

        <ChartBox title="🥧 توزیع وضعیت">
          {byStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={byStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {byStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#171a21', border: '1px solid #2a475e' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10 text-gray-500">اطلاعاتی نیست</div>
          )}
        </ChartBox>

        <ChartBox title="🌍 فروش بر اساس ریجن" span>
          {byRegionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byRegionData} layout="vertical">
                <XAxis type="number" stroke="#666" />
                <YAxis dataKey="name" type="category" stroke="#666" width={100} />
                <Tooltip
                  contentStyle={{ background: '#171a21', border: '1px solid #2a475e' }}
                  formatter={(v) => Number(v).toLocaleString('en-US')}
                />
                <Bar dataKey="value" fill="#f39c12" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10 text-gray-500">اطلاعاتی نیست</div>
          )}
        </ChartBox>
      </div>

      {/* جدول */}
      <div className="bg-[#171a21] border border-[#2a475e] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#2a475e] font-bold">
          📋 آخرین سفارشات ({orders.length})
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="bg-[#0f1922] sticky top-0">
              <tr className="text-right">
                <th className="p-3">کد</th>
                <th className="p-3">کاربر</th>
                <th className="p-3">بازی</th>
                <th className="p-3">مبلغ</th>
                <th className="p-3">وضعیت</th>
                <th className="p-3">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 50).map(o => (
                <tr key={o.id} className="border-t border-[#2a475e] hover:bg-[#0f1922]">
                  <td className="p-3 font-mono text-[#66c0f4]">{o.orderCode}</td>
                  <td className="p-3">{o.User?.username}</td>
                  <td className="p-3">
                    {o.isDLC && <span className="text-purple-400 mr-1">🎁</span>}
                    {o.isDLC ? o.DLC?.title : o.Game?.title}
                  </td>
                  <td className="p-3 text-[#66c0f4]">{(o.finalPrice || 0).toLocaleString('en-US')}</td>
                  <td className="p-3 text-xs">{statusLabels[o.status] || o.status}</td>
                  <td className="p-3 text-xs text-gray-500">
                    {new Date(o.createdAt).toLocaleDateString('fa-IR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TransactionsReport({ data }) {
  const { transactions, summary } = data;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox icon="💰" label="کل شارژ" value={Number(summary.totalDeposits).toLocaleString('en-US')} color="from-green-500 to-emerald-500" />
        <StatBox icon="🛒" label="کل خرید" value={Number(summary.totalPurchases).toLocaleString('en-US')} color="from-blue-500 to-cyan-500" />
        <StatBox icon="↩️" label="کل بازگشت" value={Number(summary.totalRefunds).toLocaleString('en-US')} color="from-red-500 to-pink-500" />
        <StatBox icon="📊" label="تعداد کل" value={summary.count} color="from-purple-500 to-indigo-500" />
      </div>

      <div className="bg-[#171a21] border border-[#2a475e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-sm">
            <thead className="bg-[#0f1922] sticky top-0">
              <tr className="text-right">
                <th className="p-3">#</th>
                <th className="p-3">کاربر</th>
                <th className="p-3">نوع</th>
                <th className="p-3">مبلغ</th>
                <th className="p-3">وضعیت</th>
                <th className="p-3">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} className="border-t border-[#2a475e] hover:bg-[#0f1922]">
                  <td className="p-3 text-gray-500">{t.id}</td>
                  <td className="p-3">{t.User?.username}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      t.type === 'deposit' ? 'bg-green-500/20 text-green-400' :
                      t.type === 'purchase' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {t.type === 'deposit' ? 'شارژ' : t.type === 'purchase' ? 'خرید' : t.type === 'refund' ? 'بازگشت' : 'بیلبورد'}
                    </span>
                  </td>
                  <td className={`p-3 font-bold ${t.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {Number(t.amount).toLocaleString('en-US')}
                  </td>
                  <td className="p-3 text-xs">
                    {t.status === 'success' ? '✅ موفق' : t.status === 'pending' ? '⏳ در انتظار' : '❌ ناموفق'}
                  </td>
                  <td className="p-3 text-xs text-gray-500">
                    {new Date(t.createdAt).toLocaleString('fa-IR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UsersReport({ users }) {
  const topBuyers = [...users].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox icon="👥" label="کل کاربران" value={users.length} color="from-blue-500 to-cyan-500" />
        <StatBox icon="✅" label="فعال" value={users.filter(u => !u.isBanned).length} color="from-green-500 to-emerald-500" />
        <StatBox icon="🚫" label="مسدود" value={users.filter(u => u.isBanned).length} color="from-red-500 to-pink-500" />
        <StatBox icon="💰" label="کل خرید" value={users.reduce((s, u) => s + u.totalSpent, 0).toLocaleString('en-US')} color="from-yellow-500 to-orange-500" />
      </div>

      {/* بهترین خریداران */}
      <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          🏆 بهترین خریداران
        </h3>
        <div className="space-y-3">
          {topBuyers.map((u, i) => (
            <div key={u.id} className="flex items-center gap-3 bg-[#0f1922] rounded-lg p-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                i === 0 ? 'bg-yellow-500 text-white' :
                i === 1 ? 'bg-gray-400 text-white' :
                i === 2 ? 'bg-orange-600 text-white' :
                'bg-[#2a475e]'
              }`}>
                #{i + 1}
              </div>
              <div className="flex-1">
                <div className="font-bold">{u.username}</div>
                <div className="text-xs text-gray-500">{u.email}</div>
              </div>
              <div className="text-right">
                <div className="text-[#66c0f4] font-bold">
                  {Number(u.totalSpent).toLocaleString('en-US')}
                </div>
                <div className="text-xs text-gray-500">{u.totalOrders} سفارش</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* جدول */}
      <div className="bg-[#171a21] border border-[#2a475e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="bg-[#0f1922] sticky top-0">
              <tr className="text-right">
                <th className="p-3">#</th>
                <th className="p-3">کاربر</th>
                <th className="p-3">ایمیل</th>
                <th className="p-3">سفارشات</th>
                <th className="p-3">مجموع خرید</th>
                <th className="p-3">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-[#2a475e] hover:bg-[#0f1922]">
                  <td className="p-3 text-gray-500">{u.id}</td>
                  <td className="p-3 font-bold">{u.username}</td>
                  <td className="p-3 text-gray-400 text-xs">{u.email}</td>
                  <td className="p-3">{u.totalOrders}</td>
                  <td className="p-3 text-[#66c0f4]">{Number(u.totalSpent).toLocaleString('en-US')}</td>
                  <td className="p-3">
                    {u.isBanned ? (
                      <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded">🚫 مسدود</span>
                    ) : (
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">✅ فعال</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function GamesReport({ games }) {
  const topSellers = [...games].sort((a, b) => b.sales - a.sales).slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox icon="🎮" label="کل بازی‌ها" value={games.length} color="from-blue-500 to-cyan-500" />
        <StatBox icon="✅" label="فعال" value={games.filter(g => g.isActive).length} color="from-green-500 to-emerald-500" />
        <StatBox icon="🛒" label="کل فروش" value={games.reduce((s, g) => s + g.sales, 0)} color="from-purple-500 to-pink-500" />
        <StatBox icon="💰" label="کل درآمد" value={games.reduce((s, g) => s + Number(g.revenue), 0).toLocaleString('en-US')} color="from-yellow-500 to-orange-500" />
      </div>

      <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6">
        <h3 className="font-bold mb-4">🏆 پرفروش‌ترین بازی‌ها</h3>
        <div className="space-y-3">
          {topSellers.map((g, i) => (
            <div key={g.id} className="flex items-center gap-3 bg-[#0f1922] rounded-lg p-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                i === 0 ? 'bg-yellow-500 text-white' :
                i === 1 ? 'bg-gray-400 text-white' :
                i === 2 ? 'bg-orange-600 text-white' :
                'bg-[#2a475e]'
              }`}>
                #{i + 1}
              </div>
              <div className="w-10 h-12 rounded overflow-hidden shrink-0">
                {g.coverImage && <img src={g.coverImage} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate">{g.title}</div>
                <div className="text-xs text-gray-500">{g.sales} فروش</div>
              </div>
              <div className="text-[#66c0f4] font-bold">
                {Number(g.revenue).toLocaleString('en-US')}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#171a21] border border-[#2a475e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="bg-[#0f1922] sticky top-0">
              <tr className="text-right">
                <th className="p-3">بازی</th>
                <th className="p-3">قیمت</th>
                <th className="p-3">موجودی</th>
                <th className="p-3">DLC</th>
                <th className="p-3">فروش</th>
                <th className="p-3">درآمد</th>
                <th className="p-3">امتیاز</th>
              </tr>
            </thead>
            <tbody>
              {games.map(g => (
                <tr key={g.id} className="border-t border-[#2a475e] hover:bg-[#0f1922]">
                  <td className="p-3 font-bold truncate max-w-xs">{g.title}</td>
                  <td className="p-3 text-xs">
                    {Number(g.basePrice).toLocaleString('en-US')}
                    {g.discount > 0 && <span className="text-green-400 mr-1"> ({g.discount}%)</span>}
                  </td>
                  <td className="p-3">{g.stock}</td>
                  <td className="p-3 text-purple-400">🎁 {g.dlcCount}</td>
                  <td className="p-3">{g.sales}</td>
                  <td className="p-3 text-[#66c0f4]">{Number(g.revenue).toLocaleString('en-US')}</td>
                  <td className="p-3 text-yellow-400">⭐ {g.rating || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-4 text-white shadow-lg`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs opacity-90">{label}</div>
    </div>
  );
}

function ChartBox({ title, children, span }) {
  return (
    <div className={`bg-[#171a21] border border-[#2a475e] rounded-xl p-4 ${span ? 'lg:col-span-2' : ''}`}>
      <h3 className="font-bold mb-4">{title}</h3>
      {children}
    </div>
  );
}