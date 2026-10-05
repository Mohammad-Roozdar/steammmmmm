import { useEffect, useState } from 'react'
import api from '../api'
import { Plus, Trash2 } from 'lucide-react'

export default function Regions() {
  const [regions, setRegions] = useState([])
  const [form, setForm] = useState({ name: '', code: '', flag: '', priceMultiplier: 1 })

  const load = () => api.get('/regions').then(r => setRegions(r.data))
  useEffect(() => { load() }, [])

  const add = async () => {
    if (!form.name) return
    await api.post('/regions', form)
    setForm({ name: '', code: '', flag: '', priceMultiplier: 1 })
    load()
  }

  const del = async (id) => {
    if (!confirm('حذف شود؟')) return
    await api.delete(`/regions/${id}`)
    load()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">🌍 ریجن‌ها</h1>

      <div className="bg-[#171a21] p-4 rounded-xl border border-[#2a475e] grid grid-cols-2 md:grid-cols-5 gap-3">
        <input placeholder="نام" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="bg-[#0f1922] border border-[#2a475e] rounded p-2" />
        <input placeholder="کد (IR)" value={form.code}
          onChange={e => setForm({ ...form, code: e.target.value })}
          className="bg-[#0f1922] border border-[#2a475e] rounded p-2" />
        <input placeholder="ایموجی فلگ" value={form.flag}
          onChange={e => setForm({ ...form, flag: e.target.value })}
          className="bg-[#0f1922] border border-[#2a475e] rounded p-2" />
        <input placeholder="ضریب قیمت" type="number" step="0.1" value={form.priceMultiplier}
          onChange={e => setForm({ ...form, priceMultiplier: +e.target.value })}
          className="bg-[#0f1922] border border-[#2a475e] rounded p-2" />
        <button onClick={add} className="bg-[#66c0f4] text-[#0f1922] rounded font-bold flex items-center justify-center gap-1">
          <Plus size={16} /> افزودن
        </button>
      </div>

      <div className="bg-[#171a21] rounded-xl border border-[#2a475e] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0f1922]">
            <tr className="text-right">
              <th className="p-3">فلگ</th>
              <th className="p-3">نام</th>
              <th className="p-3">کد</th>
              <th className="p-3">ضریب قیمت</th>
              <th className="p-3">حذف</th>
            </tr>
          </thead>
          <tbody>
            {regions.map(r => (
              <tr key={r.id} className="border-t border-[#2a475e]">
                <td className="p-3 text-lg">{r.flag}</td>
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.code}</td>
                <td className="p-3">{r.priceMultiplier}</td>
                <td className="p-3">
                  <button onClick={() => del(r.id)} className="text-red-400">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}