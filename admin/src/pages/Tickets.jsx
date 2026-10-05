import { useEffect, useState } from 'react'
import api from '../api'

export default function Tickets() {
  const [tickets, setTickets] = useState([])
  useEffect(() => {
    api.get('/tickets/admin/all').then(r => setTickets(r.data)).catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">💬 تیکت‌ها</h1>
      <div className="bg-[#171a21] rounded-xl border border-[#2a475e] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0f1922]">
            <tr className="text-right">
              <th className="p-3">#</th>
              <th className="p-3">موضوع</th>
              <th className="p-3">کاربر</th>
              <th className="p-3">اولویت</th>
              <th className="p-3">وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t.id} className="border-t border-[#2a475e]">
                <td className="p-3">{t.id}</td>
                <td className="p-3">{t.subject}</td>
                <td className="p-3">{t.User?.username}</td>
                <td className="p-3">{t.priority}</td>
                <td className="p-3">{t.status}</td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr><td colSpan="5" className="p-4 text-center text-gray-500">تیکتی نیست</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}