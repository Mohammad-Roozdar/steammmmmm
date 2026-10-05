import { useEffect, useState } from 'react';
import api from '../api';
import { Plus, Trash2, X } from 'lucide-react';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    code: '', type: 'percent', value: 10,
    minPurchase: 0, maxUses: 100, expiresAt: ''
  });

  const load = () => api.get('/coupons/admin/all').then(r => setCoupons(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.code || !form.value) return alert('کد و مقدار الزامی');
    await api.post('/coupons/admin', form);
    setShowModal(false);
    setForm({ code: '', type: 'percent', value: 10, minPurchase: 0, maxUses: 100, expiresAt: '' });
    load();
  };

  const del = async (id) => {
    if (!confirm('حذف شود؟')) return;
    await api.delete(`/coupons/admin/${id}`);
    load();
  };

  const genCode = () => {
    const code = 'SC' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setForm({ ...form, code });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🎟️ کدهای تخفیف</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#66c0f4] text-[#0f1922] font-bold px-5 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> کد جدید
        </button>
      </div>

      <div className="bg-[#171a21] rounded-xl border border-[#2a475e] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0f1922]">
            <tr className="text-right">
              <th className="p-3">کد</th>
              <th className="p-3">نوع</th>
              <th className="p-3">مقدار</th>
              <th className="p-3">استفاده شده</th>
              <th className="p-3">حداقل خرید</th>
              <th className="p-3">انقضا</th>
              <th className="p-3">حذف</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c.id} className="border-t border-[#2a475e]">
                <td className="p-3 font-mono text-[#66c0f4] font-bold">{c.code}</td>
                <td className="p-3">{c.type === 'percent' ? 'درصدی' : 'مبلغی'}</td>
                <td className="p-3">{c.type === 'percent' ? `${c.value}%` : c.value.toLocaleString()}</td>
                <td className="p-3">{c.usedCount} / {c.maxUses}</td>
                <td className="p-3">{c.minPurchase.toLocaleString()}</td>
                <td className="p-3 text-xs">
                  {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('fa-IR') : '—'}
                </td>
                <td className="p-3">
                  <button onClick={() => del(c.id)} className="text-red-400">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500">کدی ثبت نشده</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#171a21] border border-[#2a475e] rounded-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold">کد تخفیف جدید</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">کد</label>
                <div className="flex gap-2">
                  <input
                    value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="flex-1 bg-[#0f1922] border border-[#2a475e] rounded p-2 font-mono"
                  />
                  <button onClick={genCode} className="bg-[#2a475e] px-3 rounded text-xs">
                    تصادفی
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">نوع</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-[#0f1922] border border-[#2a475e] rounded p-2"
                >
                  <option value="percent">درصدی</option>
                  <option value="fixed">مبلغی (تومان)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  مقدار {form.type === 'percent' ? '(درصد)' : '(تومان)'}
                </label>
                <input
                  type="number"
                  value={form.value}
                  onChange={e => setForm({ ...form, value: +e.target.value })}
                  className="w-full bg-[#0f1922] border border-[#2a475e] rounded p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">حداقل خرید</label>
                  <input
                    type="number"
                    value={form.minPurchase}
                    onChange={e => setForm({ ...form, minPurchase: +e.target.value })}
                    className="w-full bg-[#0f1922] border border-[#2a475e] rounded p-2"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">حداکثر استفاده</label>
                  <input
                    type="number"
                    value={form.maxUses}
                    onChange={e => setForm({ ...form, maxUses: +e.target.value })}
                    className="w-full bg-[#0f1922] border border-[#2a475e] rounded p-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">تاریخ انقضا</label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                  className="w-full bg-[#0f1922] border border-[#2a475e] rounded p-2"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-[#2a475e] py-2 rounded">انصراف</button>
              <button onClick={save} className="flex-1 bg-[#66c0f4] text-[#0f1922] font-bold py-2 rounded">ذخیره</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}