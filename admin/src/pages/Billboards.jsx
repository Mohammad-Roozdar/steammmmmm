import { useEffect, useState } from 'react';
import api from '../api';
import { Eye, MousePointerClick, Check, X, Trash2, Edit, ExternalLink } from 'lucide-react';

const statusMap = {
  pending: { label: '🟡 در انتظار', color: 'bg-yellow-600' },
  active: { label: '🟢 فعال', color: 'bg-green-600' },
  expired: { label: '⚫ منقضی', color: 'bg-gray-600' },
  rejected: { label: '🔴 رد شده', color: 'bg-red-600' }
};

const positions = {
  home_top: 'بالای خانه',
  home_middle: 'وسط خانه',
  home_bottom: 'پایین خانه',
  sidebar: 'نوار کناری',
  game_detail: 'جزئیات بازی'
};

export default function Billboards() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const load = () => {
    api.get('/billboards/admin/all', { params: { status: filter !== 'all' ? filter : undefined } })
      .then(r => setItems(r.data));
  };

  useEffect(load, [filter]);

  const changeStatus = async (id, status, adminNote = '') => {
    await api.patch(`/billboards/admin/${id}`, { status, adminNote });
    load();
    setSelected(null);
  };

  const del = async (id) => {
    if (!confirm('حذف شود؟')) return;
    await api.delete(`/billboards/${id}`);
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">📢 مدیریت بیلبوردها</h1>

      <div className="flex gap-2 flex-wrap">
        {['all', ...Object.keys(statusMap)].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === s ? 'bg-[#66c0f4] text-[#0f1922] font-bold' : 'bg-[#171a21] hover:bg-[#2a475e]'
            }`}
          >
            {s === 'all' ? 'همه' : statusMap[s].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(b => (
          <div key={b.id} className="bg-[#171a21] border border-[#2a475e] rounded-xl overflow-hidden">
            {b.image && (
              <img src={b.image} className="w-full aspect-[6/1] object-cover" />
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-bold">{b.title}</h3>
                  <div className="text-sm text-gray-400">{b.company}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    📍 {positions[b.position]} | 📞 {b.contactPhone}
                  </div>
                </div>
                <span className={`${statusMap[b.status].color} px-2 py-1 rounded text-xs shrink-0`}>
                  {statusMap[b.status].label}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 border-t border-[#2a475e] pt-3 mb-3">
                <div className="flex items-center gap-1">
                  <Eye size={12} /> {b.views || 0} بازدید
                </div>
                <div className="flex items-center gap-1">
                  <MousePointerClick size={12} /> {b.clicks || 0} کلیک
                </div>
                <div>
                  {b.price ? `${b.price.toLocaleString()} ت` : '—'}
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {b.status === 'pending' && (
                  <>
                    <button onClick={() => changeStatus(b.id, 'active')} className="bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded text-xs flex items-center gap-1">
                      <Check size={12} /> تایید
                    </button>
                    <button onClick={() => changeStatus(b.id, 'rejected')} className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-xs flex items-center gap-1">
                      <X size={12} /> رد
                    </button>
                  </>
                )}
                {b.status === 'active' && (
                  <button onClick={() => changeStatus(b.id, 'expired')} className="bg-gray-600 hover:bg-gray-700 px-3 py-1.5 rounded text-xs">
                    پایان یافته
                  </button>
                )}
                {b.link && (
                  <a href={b.link} target="_blank" className="bg-[#2a475e] hover:bg-[#3a5a78] px-3 py-1.5 rounded text-xs flex items-center gap-1">
                    <ExternalLink size={12} /> لینک
                  </a>
                )}
                <button onClick={() => del(b.id)} className="bg-red-900/40 hover:bg-red-900/60 px-3 py-1.5 rounded text-xs ml-auto">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="md:col-span-2 text-center py-20 text-gray-500 bg-[#171a21] rounded-xl border border-[#2a475e]">
            بیلبوردی نیست
          </div>
        )}
      </div>
    </div>
  );
}