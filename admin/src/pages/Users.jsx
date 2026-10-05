import { useEffect, useState } from 'react';
import api from '../api';
import { Ban, Check, Shield, User as UserIcon, Search } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');

  const load = async () => {
    const { data } = await api.get('/users/admin/all');
    setUsers(data);
    setFiltered(data);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!search.trim()) return setFiltered(users);
    setFiltered(users.filter(u =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, users]);

  const toggleBan = async (u) => {
    await api.patch(`/users/admin/${u.id}`, { isBanned: !u.isBanned });
    load();
  };

  const changeRole = async (u, role) => {
    if (!confirm(`نقش ${u.username} به ${role} تغییر کنه؟`)) return;
    await api.patch(`/users/admin/${u.id}`, { role });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">👥 کاربران ({users.length})</h1>
        <div className="relative">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="جستجو..."
            className="bg-[#171a21] border border-[#2a475e] rounded-lg pr-10 pl-4 py-2 w-64"
          />
        </div>
      </div>

      <div className="bg-[#171a21] rounded-xl border border-[#2a475e] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0f1922]">
            <tr className="text-right">
              <th className="p-3">#</th>
              <th className="p-3">کاربر</th>
              <th className="p-3">ایمیل</th>
              <th className="p-3">نقش</th>
              <th className="p-3">کیف پول</th>
              <th className="p-3">وضعیت</th>
              <th className="p-3">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-t border-[#2a475e] hover:bg-[#0f1922]">
                <td className="p-3 text-gray-500">{u.id}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#66c0f4] text-[#0f1922] flex items-center justify-center font-bold text-xs">
                      {u.avatar ? <img src={u.avatar} className="w-full h-full rounded-full object-cover" /> : u.username[0].toUpperCase()}
                    </div>
                    <span className="font-bold">{u.username}</span>
                  </div>
                </td>
                <td className="p-3 text-gray-400">{u.email}</td>
                <td className="p-3">
                  <select
                    value={u.role}
                    onChange={e => changeRole(u, e.target.value)}
                    className="bg-[#0f1922] border border-[#2a475e] rounded px-2 py-1 text-xs"
                  >
                    <option value="user">کاربر</option>
                    <option value="support">پشتیبان</option>
                    <option value="admin">ادمین</option>
                  </select>
                </td>
                <td className="p-3 text-[#66c0f4]">{(u.wallet || 0).toLocaleString()}</td>
                <td className="p-3">
                  {u.isBanned ? (
                    <span className="bg-red-600 px-2 py-1 rounded text-xs">🚫 بن</span>
                  ) : (
                    <span className="bg-green-600 px-2 py-1 rounded text-xs">✅ فعال</span>
                  )}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => toggleBan(u)}
                    className={`text-xs px-3 py-1 rounded ${
                      u.isBanned
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {u.isBanned ? 'آنبن' : 'بن'}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500">کاربری نیست</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}