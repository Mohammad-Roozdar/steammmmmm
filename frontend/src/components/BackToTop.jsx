'use client';
import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-[#66c0f4] text-[#171a21] rounded-full shadow-2xl hover:bg-[#4fa8d8] transition flex items-center justify-center animate-bounce-in"
      title="بازگشت به بالا"
    >
      <ArrowUp size={22} />
    </button>
  );
}