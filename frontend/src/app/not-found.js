import Link from 'next/link';
import { Home, Search, Gamepad2 } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-20 text-center min-h-[70vh] flex items-center justify-center">
      <div>
        <div className="text-9xl font-bold text-[#66c0f4] mb-4 animate-float">۴۰۴</div>
        <Gamepad2 size={80} className="mx-auto text-[#2a475e] mb-6" />
        <h1 className="text-3xl font-bold mb-3">صفحه مورد نظر پیدا نشد!</h1>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          احتمالاً آدرس رو اشتباه وارد کردی، یا صفحه پاک شده. بیا برگردیم به مسیر اصلی!
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/"
            className="bg-[#66c0f4] text-[#171a21] font-bold px-6 py-3 rounded-lg hover:bg-[#4fa8d8] flex items-center gap-2 transition hover:scale-105"
          >
            <Home size={16} /> صفحه اصلی
          </Link>
          <Link
            href="/games"
            className="bg-[#171a21] border border-[#2a475e] font-bold px-6 py-3 rounded-lg hover:border-[#66c0f4] flex items-center gap-2 transition"
          >
            <Search size={16} /> جستجوی بازی
          </Link>
        </div>
      </div>
    </div>
  );
}