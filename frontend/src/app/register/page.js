'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      const { data } = await api.post('/auth/login', {
        email: form.email,
        password: form.password
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/');
    } catch (e) {
      setErr(e.response?.data?.error || 'خطا');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-[#171a21] p-8 rounded-xl border border-[#2a475e] w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#66c0f4]">ثبت‌نام</h1>
        {err && <div className="bg-red-900/40 text-red-300 p-3 rounded mb-4 text-sm">{err}</div>}
        <input
          placeholder="نام کاربری"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="w-full bg-[#0f1922] border border-[#2a475e] rounded p-3 mb-3"
          required
        />
        <input
          type="email"
          placeholder="ایمیل"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full bg-[#0f1922] border border-[#2a475e] rounded p-3 mb-3"
          required
        />
        <input
          type="password"
          placeholder="رمز عبور"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full bg-[#0f1922] border border-[#2a475e] rounded p-3 mb-4"
          required
        />
        <button className="w-full bg-[#66c0f4] text-[#171a21] font-bold py-3 rounded hover:bg-[#4fa8d8]">
          ثبت‌نام
        </button>
        <p className="text-center text-sm text-gray-400 mt-4">
          حساب داری؟{' '}
          <Link href="/login" className="text-[#66c0f4] hover:underline">ورود</Link>
        </p>
      </form>
    </div>
  );
}