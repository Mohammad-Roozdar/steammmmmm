import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Login() {
  const [email, setEmail] = useState('admin@steamclub.local')
  const [password, setPassword] = useState('admin123')
  const [err, setErr] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post('/auth/login', { email, password })
      if (data.user.role !== 'admin') return setErr('دسترسی ادمین ندارید')
      localStorage.setItem('admin_token', data.token)
      navigate('/')
    } catch (e) {
      setErr(e.response?.data?.error || 'خطا در ورود')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1922]" dir="rtl">
      <form onSubmit={submit} className="bg-[#171a21] p-8 rounded-xl w-96 border border-[#2a475e]">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#66c0f4]">ورود ادمین</h1>
        {err && <div className="bg-red-900/40 text-red-300 p-3 rounded mb-4 text-sm">{err}</div>}
        <input
          className="w-full p-3 mb-3 bg-[#0f1922] border border-[#2a475e] rounded"
          placeholder="ایمیل" value={email} onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full p-3 mb-4 bg-[#0f1922] border border-[#2a475e] rounded"
          placeholder="رمز" value={password} onChange={e => setPassword(e.target.value)}
        />
        <button className="w-full bg-[#66c0f4] text-[#0f1922] font-bold py-3 rounded hover:bg-[#4fa8d8]">
          ورود
        </button>
      </form>
    </div>
  )
}