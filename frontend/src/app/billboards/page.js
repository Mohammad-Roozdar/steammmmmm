'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';
import { Megaphone, Eye, MousePointerClick } from 'lucide-react';

export default function MyBillboards() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getUser()) return router.push('/login?next=/billboards');
    api.get('/billboards/my').then((r) => {
      setItems(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20">...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Megaphone /> بیلبوردهای من
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-[#171a21] rounded-xl border border-[#2a475e]">
          <Megaphone size={48} className="mx-auto mb-4 opacity-30" />
          هنوز بیلبوردی ثبت نکردی
          <div className="mt-4">
            <a href="/advertise" className="text-[#66c0f4] hover:underline">
              رزرو اولین بیلبورد →
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((b) => (
            <div key={b.id} className="bg-[#171a21] border border-[#2a475e] rounded-xl overflow-hidden">
              {b.image && (
                <img src={b.image} className="w-full aspect-[6/1] object-cover" />
              )}
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold">{b.title}</h3>
                    <div className="text-xs text-gray-500">{b.company}</div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="flex justify-between text-xs text-gray-400 border-t border-[#2a475e] pt-3">
                  <span className="flex items-center gap-1">
                    <Eye size={12} /> {b.views || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MousePointerClick size={12} /> {b.clicks || 0}
                  </span>
                  <span>
                    {new Date(b.startDate).toLocaleDateString('fa-IR')} تا{' '}
                    {new Date(b.endDate).toLocaleDateString('fa-IR')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: { label: '🟡 در انتظار تایید', color: 'bg-yellow-600' },
    active: { label: '🟢 فعال', color: 'bg-green-600' },
    expired: { label: '⚫ منقضی', color: 'bg-gray-600' },
    rejected: { label: '🔴 رد شده', color: 'bg-red-600' }
  };
  const s = map[status] || map.pending;
  return <span className={`${s.color} text-xs px-2 py-1 rounded`}>{s.label}</span>;
}