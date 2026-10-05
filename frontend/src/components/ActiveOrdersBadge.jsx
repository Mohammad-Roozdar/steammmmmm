'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';
import { Package, Clock } from 'lucide-react';

export default function ActiveOrdersBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const load = () => {
      if (!getUser()) return;
      api.get('/orders/my').then((r) => {
        const active = r.data.filter((o) =>
          ['paid', 'in_progress'].includes(o.status)
        ).length;
        setCount(active);
      }).catch(() => {});
    };
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  if (count === 0) return null;

  return (
    <Link
      href="/orders"
      className="fixed bottom-24 left-6 z-40 bg-gradient-to-l from-yellow-500 to-orange-500 text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition flex items-center gap-2 animate-pulse-ring"
    >
      <Clock size={18} className="animate-spin" />
      <span className="font-bold text-sm">
        {count} سفارش در حال انجام
      </span>
    </Link>
  );
}