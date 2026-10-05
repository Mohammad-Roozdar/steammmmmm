import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { Eye, Search, X, Copy, CheckCircle, Clock } from 'lucide-react';

const statusColors = {
  pending_payment: 'bg-gray-600',
  paid: 'bg-yellow-600',
  in_progress: 'bg-blue-600',
  completed: 'bg-green-600',
  failed: 'bg-red-600',
  refunded: 'bg-purple-600',
};
const statusLabels = {
  pending_payment: 'در انتظار پرداخت',
  paid: 'در انتظار انجام',
  in_progress: 'در حال انجام',
  completed: 'تکمیل شده',
  failed: 'ناموفق',
  refunded: 'مرجوعی',
};

export default function Orders() {
  const { id } = useParams();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('paid');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [creds, setCreds] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreds, setShowCreds] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders/admin/all', {
        params: { status: filter, search, page }
      });
      setOrders(data.orders);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter, search, page]);
  useEffect(() => { if (id) openOrder(id); }, [id]);

  const openOrder = async (oid) => {
    try {
      const { data } = await api.get(`/orders/admin/${oid}`);
      setSelected(data);
      setCreds({
        username: data.steamUsername,
        password: data.steamPassword,
        guard: data.steamGuardCode
      });
      setNote(data.adminNote || '');
    } catch (e) {
      alert(e.response?.data?.error || 'خطا در بارگذاری');
    }
  };

  const changeStatus = async (status) => {
    if (!selected) return;
    try {
      await api.patch(`/orders/admin/${selected.id}/status`, { status, adminNote: note });
      setSelected({ ...selected, status });
      load();
    } catch (e) {
      alert('خطا');
    }
  };

  const copy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">📦 سفارشات</h1>
        <div className="relative">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="جستجوی کد سفارش..."
            className="bg-[#171a21] border border-[#2a475e] rounded-lg pr-10 pl-4 py-2 w-72"
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', ...Object.keys(statusLabels)].map(s => (
          <button
            key={s}
            onClick={() => { setFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === s ? 'bg-[#66c0f4] text-[#0f1922] font-bold' : 'bg-[#171a21] hover:bg-[#2a475e]'
            }`}
          >
            {s === 'all' ? 'همه' : statusLabels[s]}
          </button>
        ))}
      </div>

      <div className="bg-[#171a21] rounded-xl border border-[#2a475e] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0f1922]">
            <tr className="text-right">
              <th className="p-3">کد</th>
              <th className="p-3">بازی</th>
              <th className="p-3">کاربر</th>
              <th className="p-3">مبلغ</th>
              <th className="p-3">وضعیت</th>
              <th className="p-3">تاریخ</th>
              <th className="p-3">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="p-8 text-center">در حال بارگذاری...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500">سفارشی نیست</td></tr>
            ) : (
              orders.map(o => (
                <tr key={o.id} className="border-t border-[#2a475e] hover:bg-[#0f1922]">
                  <td className="p-3 font-mono text-[#66c0f4]">{o.orderCode}</td>
                  <td className="p-3">{o.Game?.title}</td>
                  <td className="p-3">{o.User?.username}</td>
                  <td className="p-3">{(o.finalPrice || o.totalPrice)?.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`${statusColors[o.status]} px-2 py-1 rounded text-xs`}>
                      {statusLabels[o.status]}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-gray-400">
                    {new Date(o.createdAt).toLocaleDateString('fa-IR')}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => openOrder(o.id)}
                      className="text-[#66c0f4] hover:underline flex items-center gap-1"
                    >
                      <Eye size={14} /> مشاهده
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > 20 && (
        <div className="flex justify-center gap-2 flex-wrap">
          {Array.from({ length: Math.ceil(total / 20) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-10 h-10 rounded ${
                page === i + 1 ? 'bg-[#66c0f4] text-[#0f1922] font-bold' : 'bg-[#171a21] hover:bg-[#2a475e]'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-[#171a21] rounded-xl border border-[#2a475e] max-w-3xl w-full my-8 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#2a475e] sticky top-0 bg-[#171a21] z-10">
              <h2 className="font-bold">سفارش {selected.orderCode}</h2>
              <button onClick={() => setSelected(null)} className="hover:text-red-400">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* وضعیت */}
              <div className="flex items-center gap-3">
                <span className={`${statusColors[selected.status]} px-3 py-1.5 rounded-lg text-sm font-bold`}>
                  {statusLabels[selected.status]}
                </span>
                <span className="text-xs text-gray-500">
                  ساخته شده: {new Date(selected.createdAt).toLocaleString('fa-IR')}
                </span>
              </div>

              {/* اطلاعات بازی و کاربر */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0f1922] border border-[#2a475e] rounded-lg p-4 space-y-2 text-sm">
                  <h3 className="font-bold text-[#66c0f4] mb-3">🎮 اطلاعات بازی</h3>
                  <Row label="بازی" value={selected.Game?.title} />
                  <Row label="ریجن" value={selected.Region?.name} />
                  <Row label="قیمت پایه" value={selected.unitPrice?.toLocaleString()} />
                  <Row label="تخفیف" value={selected.discountAmount?.toLocaleString()} />
                  <Row label="قیمت نهایی" value={selected.finalPrice?.toLocaleString()} bold />
                  {selected.discountCode && <Row label="کد تخفیف" value={selected.discountCode} />}
                </div>

                <div className="bg-[#0f1922] border border-[#2a475e] rounded-lg p-4 space-y-2 text-sm">
                  <h3 className="font-bold text-[#66c0f4] mb-3">👤 اطلاعات کاربر</h3>
                  <Row label="نام کاربری" value={selected.User?.username} />
                  <Row label="ایمیل" value={selected.User?.email} />
                  <Row label="موبایل" value={selected.User?.phone || '—'} />
                  <Row label="شناسه" value={selected.User?.id} />
                </div>
              </div>

              {/* 🔐 اطلاعات استیم */}
              <div className="bg-[#0f1922] border border-yellow-600/40 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-yellow-400">🔐 اطلاعات استیم</h3>
                  <button
                    onClick={() => setShowCreds(!showCreds)}
                    className="text-xs text-[#66c0f4] hover:underline"
                  >
                    {showCreds ? 'مخفی کن' : 'نمایش بده'}
                  </button>
                </div>

                {showCreds && (
                  <div className="space-y-2 font-mono text-sm">
                    <CredRow label="یوزرنیم" value={creds?.username} onCopy={copy} />
                    <CredRow label="پسورد" value={creds?.password} onCopy={copy} />
                    {creds?.guard && (
                      <CredRow label="کد گارد" value={creds?.guard} onCopy={copy} />
                    )}
                  </div>
                )}

                {selected.userNote && (
                  <div className="mt-3 p-3 bg-[#171a21] rounded text-xs">
                    <b className="text-gray-400">یادداشت کاربر:</b>
                    <p className="mt-1 whitespace-pre-wrap">{selected.userNote}</p>
                  </div>
                )}
              </div>

              {/* یادداشت ادمین */}
              <div>
                <label className="text-sm text-gray-400 block mb-2">📝 یادداشت ادمین</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0f1922] border border-[#2a475e] rounded p-3"
                  placeholder="توضیح یا یادداشت..."
                />
              </div>

              {/* دکمه‌های تغییر وضعیت */}
              <div>
                <div className="text-sm text-gray-400 mb-2">تغییر وضعیت:</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button onClick={() => changeStatus('in_progress')} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm">
                    ⏳ در حال انجام
                  </button>
                  <button onClick={() => changeStatus('completed')} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm">
                    ✅ تکمیل
                  </button>
                  <button onClick={() => changeStatus('failed')} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm">
                    ❌ ناموفق
                  </button>
                  <button onClick={() => changeStatus('refunded')} className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm">
                    ↩️ مرجوع
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}:</span>
      <span className={bold ? 'text-[#66c0f4] font-bold' : 'text-white'}>
        {value || '—'}
      </span>
    </div>
  );
}

function CredRow({ label, value, onCopy }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between bg-[#171a21] p-2 rounded">
      <span className="text-gray-500 text-xs">{label}:</span>
      <span className="flex-1 text-right text-white select-all">{value}</span>
      <button
        onClick={() => onCopy(value)}
        className="text-[#66c0f4] hover:text-white text-xs p-1"
        title="کپی"
      >
        <Copy size={14} />
      </button>
    </div>
  );
}