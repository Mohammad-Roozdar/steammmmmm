'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';
import Link from 'next/link';
import { Package, Clock, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

const statusMap = {
  pending_payment: { label: 'در انتظار پرداخت', color: 'bg-gray-600', icon: Clock },
  paid: { label: 'پرداخت شده - در انتظار انجام', color: 'bg-yellow-600', icon: Clock },
  in_progress: { label: 'در حال انجام', color: 'bg-blue-600', icon: Clock },
  completed: { label: 'تکمیل شده', color: 'bg-green-600', icon: CheckCircle2 },
  failed: { label: 'ناموفق', color: 'bg-red-600', icon: XCircle },
  refunded: { label: 'مرجوع شده', color: 'bg-purple-600', icon: RotateCcw }
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getUser()) return router.push('/login?next=/orders');
    api.get('/orders/my').then((r) => {
      setOrders(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  if (loading) return <div className="text-center py-20">...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Package /> سفارشات من
      </h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>
          همه ({orders.length})
        </FilterBtn>
        {Object.entries(statusMap).map(([key, val]) => {
          const count = orders.filter((o) => o.status === key).length;
          if (count === 0) return null;
          return (
            <FilterBtn key={key} active={filter === key} onClick={() => setFilter(key)}>
              {val.label} ({count})
            </FilterBtn>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-[#171a21] rounded-xl border border-[#2a475e]">
          <Package size={48} className="mx-auto mb-4 opacity-30" />
          سفارشی نیست
          <div className="mt-4">
            <Link href="/games" className="text-[#66c0f4] hover:underline">
              رفتن به فروشگاه →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((o) => {
            const st = statusMap[o.status] || statusMap.pending_payment;
            const Icon = st.icon;
            return (
              <div key={o.id} className="bg-[#171a21] border border-[#2a475e] rounded-xl p-4 hover:border-[#66c0f4]/50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-[#0f1922] rounded overflow-hidden shrink-0">
                    {o.Game?.coverImage ? (
                      <img src={o.Game.coverImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🎮</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{o.Game?.title}</div>
                    <div className="text-sm text-gray-400 font-mono">{o.orderCode}</div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>📍 {o.Region?.name}</span>
                      <span>📅 {new Date(o.createdAt).toLocaleDateString('fa-IR')}</span>
                    </div>
                  </div>
                  <div className="text-left shrink-0">
                    <div className="text-[#66c0f4] font-bold text-lg">
                      {o.finalPrice?.toLocaleString() || o.totalPrice?.toLocaleString()} ت
                    </div>
                    <div className={`${st.color} text-xs px-3 py-1 rounded flex items-center gap-1 mt-1`}>
                      <Icon size={12} /> {st.label}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm transition ${
        active ? 'bg-[#66c0f4] text-[#171a21] font-bold' : 'bg-[#171a21] hover:bg-[#2a475e]'
      }`}
    >
      {children}
    </button>
  );
}