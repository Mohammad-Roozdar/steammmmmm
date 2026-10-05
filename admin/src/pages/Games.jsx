import { useEffect, useState } from 'react';
import api from '../api';
import ImageUploader from '../components/ImageUploader';
import { Plus, Trash2, Edit, X, Search, Gift } from 'lucide-react';

const empty = {
  title: '', slug: '', steamAppId: '',
  shortDescription: '', description: '',
  coverImage: '', bannerImage: '', trailerUrl: '',
  screenshots: '', genres: '', tags: '',
  developer: '', publisher: '', releaseDate: '',
  basePrice: 0, discount: 0, stock: 0,
  isFeatured: false, isActive: true
};

export default function Games() {
  const [games, setGames] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get('/games');
      setGames(data);
      setFiltered(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!search.trim()) return setFiltered(games);
    setFiltered(games.filter(g =>
      g.title.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, games]);

  const openNew = () => {
    setForm(empty);
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (g) => {
    setForm({
      ...g,
      screenshots: (() => { try { return JSON.parse(g.screenshots || '[]').join('\n'); } catch { return ''; } })(),
      genres: (() => { try { return JSON.parse(g.genres || '[]').join(', '); } catch { return ''; } })(),
      tags: (() => { try { return JSON.parse(g.tags || '[]').join(', '); } catch { return ''; } })(),
      releaseDate: g.releaseDate ? g.releaseDate.slice(0, 10) : ''
    });
    setEditing(g.id);
    setShowModal(true);
  };

  const save = async () => {
    if (!form.title || !form.basePrice) return alert('عنوان و قیمت الزامی است');

    const payload = {
      ...form,
      screenshots: JSON.stringify(form.screenshots.split('\n').map(s => s.trim()).filter(Boolean)),
      genres: JSON.stringify(form.genres.split(',').map(s => s.trim()).filter(Boolean)),
      tags: JSON.stringify(form.tags.split(',').map(s => s.trim()).filter(Boolean)),
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-'),
      releaseDate: form.releaseDate || null
    };

    try {
      if (editing) await api.put(`/games/${editing}`, payload);
      else await api.post('/games', payload);
      setShowModal(false);
      load();
    } catch (e) {
      alert(e.response?.data?.error || 'خطا');
    }
  };

  const del = async (id) => {
    if (!confirm('مطمئنی؟')) return;
    await api.delete(`/games/${id}`);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">🎮 بازی‌ها ({games.length})</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="جستجو..."
              className="bg-[#171a21] border border-[#2a475e] rounded-lg pr-10 pl-4 py-2 w-64"
            />
          </div>
          <button
            onClick={openNew}
            className="bg-[#66c0f4] text-[#0f1922] font-bold px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-[#4fa8d8]"
          >
            <Plus size={18} /> افزودن بازی
          </button>
        </div>
      </div>

      <div className="bg-[#171a21] rounded-xl border border-[#2a475e] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0f1922]">
            <tr className="text-right">
              <th className="p-3">تصویر</th>
              <th className="p-3">عنوان</th>
              <th className="p-3">قیمت</th>
              <th className="p-3">تخفیف</th>
              <th className="p-3">موجودی</th>
              <th className="p-3">ویژه</th>
              <th className="p-3">فعال</th>
              <th className="p-3">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(g => (
              <tr key={g.id} className="border-t border-[#2a475e] hover:bg-[#0f1922]">
                <td className="p-3">
                  <div className="w-12 h-16 bg-[#0f1922] rounded overflow-hidden">
                    {g.coverImage ? (
                      <img src={g.coverImage} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">🎮</div>
                    )}
                  </div>
                </td>
                <td className="p-3 font-bold">{g.title}</td>
                <td className="p-3 text-[#66c0f4]">{g.basePrice?.toLocaleString('en-US')}</td>
                <td className="p-3">
                  {g.discount > 0 ? (
                    <span className="bg-green-600 px-2 py-1 rounded text-xs">{g.discount}%</span>
                  ) : '—'}
                </td>
                <td className="p-3">{g.stock}</td>
                <td className="p-3">{g.isFeatured ? '⭐' : '—'}</td>
                <td className="p-3">{g.isActive ? '✅' : '❌'}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => openEdit(g)} className="text-[#66c0f4] hover:text-white">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => del(g.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan="8" className="p-8 text-center text-gray-500">بازی‌ای یافت نشد</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-[#171a21] border border-[#2a475e] rounded-xl max-w-4xl w-full my-8 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#2a475e] sticky top-0 bg-[#171a21] z-10">
              <h2 className="font-bold text-lg">
                {editing ? '✏️ ویرایش' : '➕ افزودن بازی'}
              </h2>
              <button onClick={() => setShowModal(false)} className="hover:text-red-400">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <Section title="📝 اطلاعات پایه">
                <Field label="عنوان *">
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </Field>
                <Field label="Slug (خودکار)">
                  <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
                </Field>
                <Field label="AppID استیم">
                  <input value={form.steamAppId} onChange={e => setForm({ ...form, steamAppId: e.target.value })} />
                </Field>
                <Field label="توضیح کوتاه" span={2}>
                  <input value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} />
                </Field>
                <Field label="توضیحات کامل" span={2}>
                  <textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </Field>
              </Section>

              <Section title="🖼️ تصاویر و ویدیو">
                <div className="md:col-span-2">
                  <ImageUploader
                    value={form.coverImage}
                    onChange={(url) => setForm({ ...form, coverImage: url })}
                    type="games"
                    label="کاور (600x900)"
                  />
                </div>
                <div className="md:col-span-2">
                  <ImageUploader
                    value={form.bannerImage}
                    onChange={(url) => setForm({ ...form, bannerImage: url })}
                    type="games"
                    label="بنر بزرگ (1920x620)"
                  />
                </div>
                <Field label="لینک ویدیو (YouTube embed)" span={2}>
                  <input value={form.trailerUrl} onChange={e => setForm({ ...form, trailerUrl: e.target.value })} placeholder="https://www.youtube.com/embed/xxxxx" />
                </Field>
                <Field label="اسکرین‌شات‌ها (هر خط یه URL)" span={2}>
                  <textarea rows={4} value={form.screenshots} onChange={e => setForm({ ...form, screenshots: e.target.value })} />
                </Field>
              </Section>

              <Section title="🏷️ دسته‌بندی">
                <Field label="ژانرها (با کاما)" span={2}>
                  <input value={form.genres} onChange={e => setForm({ ...form, genres: e.target.value })} placeholder="اکشن, RPG" />
                </Field>
                <Field label="تگ‌ها (با کاما)" span={2}>
                  <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
                </Field>
                <Field label="سازنده">
                  <input value={form.developer} onChange={e => setForm({ ...form, developer: e.target.value })} />
                </Field>
                <Field label="ناشر">
                  <input value={form.publisher} onChange={e => setForm({ ...form, publisher: e.target.value })} />
                </Field>
                <Field label="تاریخ انتشار" span={2}>
                  <input type="date" value={form.releaseDate} onChange={e => setForm({ ...form, releaseDate: e.target.value })} />
                </Field>
              </Section>

              <Section title="💰 قیمت و موجودی">
                <Field label="قیمت پایه (تومان) *">
                  <input type="number" value={form.basePrice} onChange={e => setForm({ ...form, basePrice: +e.target.value })} />
                </Field>
                <Field label="تخفیف (%)">
                  <input type="number" min="0" max="100" value={form.discount} onChange={e => setForm({ ...form, discount: +e.target.value })} />
                </Field>
                <Field label="موجودی">
                  <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: +e.target.value })} />
                </Field>
              </Section>

              {/* 🎁 DLCها */}
              {editing && (
                <Section title="🎁 DLCها (محتواهای اضافی)">
                  <DLCManager gameId={editing} />
                </Section>
              )}

              <Section title="⚙️ وضعیت">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} className="w-5 h-5" />
                  <span>⭐ نمایش در اسلایدر ویژه</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-5 h-5" />
                  <span>✅ فعال باشد</span>
                </label>
              </Section>
            </div>

            <div className="flex gap-2 p-4 border-t border-[#2a475e] sticky bottom-0 bg-[#171a21]">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-[#2a475e] py-3 rounded hover:bg-[#3a5a78]">انصراف</button>
              <button onClick={save} className="flex-1 bg-[#66c0f4] text-[#171a21] font-bold py-3 rounded hover:bg-[#4fa8d8]">
                {editing ? 'ذخیره' : 'افزودن'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ DLC Manager ============ */
function DLCManager({ gameId }) {
  const [dlcs, setDlcs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', coverImage: '',
    basePrice: 0, discount: 0, steamAppId: ''
  });

  const load = () => {
    api.get(`/dlcs/game/${gameId}`).then(r => setDlcs(r.data)).catch(() => {});
  };

  useEffect(load, [gameId]);

  const save = async () => {
    if (!form.title || !form.basePrice) return alert('عنوان و قیمت الزامی');
    try {
      await api.post('/dlcs', { ...form, GameId: gameId });
      setForm({ title: '', description: '', coverImage: '', basePrice: 0, discount: 0, steamAppId: '' });
      setShowForm(false);
      load();
    } catch (e) {
      alert(e.response?.data?.error || 'خطا');
    }
  };

  const del = async (id) => {
    if (!confirm('حذف شود؟')) return;
    await api.delete(`/dlcs/${id}`);
    load();
  };

  return (
    <div className="md:col-span-2 space-y-3">
      {dlcs.length === 0 && !showForm && (
        <div className="text-center py-6 text-gray-500 text-sm bg-[#0f1922] rounded-lg">
          <Gift size={32} className="mx-auto mb-2 opacity-30" />
          هنوز DLCای اضافه نشده
        </div>
      )}

      {dlcs.map((d) => (
        <div key={d.id} className="flex items-center gap-3 bg-[#0f1922] rounded-lg p-3">
          <div className="w-12 h-14 bg-[#171a21] rounded overflow-hidden shrink-0">
            {d.coverImage ? (
              <img src={d.coverImage} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">🎁</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm truncate">{d.title}</div>
            <div className="text-xs text-gray-500">
              {Number(d.basePrice).toLocaleString('en-US')} تومان
              {d.discount > 0 && <span className="text-green-400 mr-2"> ({d.discount}% تخفیف)</span>}
            </div>
          </div>
          <button onClick={() => del(d.id)} className="text-red-400 hover:text-red-300">
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 text-purple-300 transition"
        >
          <Plus size={16} /> افزودن DLC جدید
        </button>
      ) : (
        <div className="bg-[#0f1922] rounded-lg p-4 space-y-3">
          <div className="text-xs text-purple-400 font-bold flex items-center gap-2 mb-2">
            <Gift size={14} /> DLC جدید
          </div>

          <input
            placeholder="عنوان DLC *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-[#171a21] border border-[#2a475e] rounded p-2"
          />

          <input
            placeholder="توضیحات"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-[#171a21] border border-[#2a475e] rounded p-2"
          />

          <input
            placeholder="لینک عکس"
            value={form.coverImage}
            onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
            className="w-full bg-[#171a21] border border-[#2a475e] rounded p-2"
          />

          <input
            placeholder="AppID استیم (اختیاری)"
            value={form.steamAppId}
            onChange={(e) => setForm({ ...form, steamAppId: e.target.value })}
            className="w-full bg-[#171a21] border border-[#2a475e] rounded p-2"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="قیمت (تومان) *"
              value={form.basePrice}
              onChange={(e) => setForm({ ...form, basePrice: +e.target.value })}
              className="bg-[#171a21] border border-[#2a475e] rounded p-2"
            />
            <input
              type="number"
              placeholder="تخفیف %"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: +e.target.value })}
              className="bg-[#171a21] border border-[#2a475e] rounded p-2"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 bg-[#2a475e] py-2 rounded hover:bg-[#3a5a78]"
            >
              انصراف
            </button>
            <button
              onClick={save}
              className="flex-1 bg-purple-500 hover:bg-purple-600 py-2 rounded font-bold"
            >
              افزودن DLC
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ کمکی ============ */
function Section({ title, children }) {
  return (
    <div>
      <h3 className="font-bold text-[#66c0f4] mb-3 pb-2 border-b border-[#2a475e]">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function Field({ label, children, span }) {
  return (
    <div className={span === 2 ? 'md:col-span-2' : ''}>
      <label className="text-xs text-gray-400 block mb-1">{label}</label>
      <div className="[&>input]:w-full [&>input]:bg-[#0f1922] [&>input]:border [&>input]:border-[#2a475e] [&>input]:rounded [&>input]:p-2 [&>textarea]:w-full [&>textarea]:bg-[#0f1922] [&>textarea]:border [&>textarea]:border-[#2a475e] [&>textarea]:rounded [&>textarea]:p-2">
        {children}
      </div>
    </div>
  );
}