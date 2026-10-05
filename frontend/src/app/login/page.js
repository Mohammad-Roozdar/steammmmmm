'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { setAuth } from '@/lib/auth';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/';

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.token, data.user);
      router.push(next);
    } catch (e) {
      setErr(e.response?.data?.error || 'خطا در ورود');
    }
  };

  return (
    <form onSubmit={submit} className="bg-[#171a21] p-8 rounded-xl border border-[#2a475e] w-full max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center text-[#66c0f4]">ورود به حساب</h1>
      {err && <div className="bg-red-900/40 text-red-300 p-3 rounded mb-4 text-sm">{err}</div>}
      <input
        type="email"
        placeholder="ایمیل"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-[#0f1922] border border-[#2a475e] rounded p-3 mb-3"
        required
      />
      <input
        type="password"
        placeholder="رمز عبور"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full bg-[#0f1922] border border-[#2a475e] rounded p-3 mb-4"
        required
      />
      <button className="w-full bg-[#66c0f4] text-[#171a21] font-bold py-3 rounded hover:bg-[#4fa8d8]">
        ورود
      </button>
      <p className="text-center text-sm text-gray-400 mt-4">
        حساب نداری؟{' '}
        <Link href="/register" className="text-[#66c0f4] hover:underline">ثبت‌نام کن</Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Suspense fallback={<div>...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}