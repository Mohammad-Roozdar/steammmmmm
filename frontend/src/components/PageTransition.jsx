'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    setTransitioning(true);
    const t = setTimeout(() => setTransitioning(false), 400);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div
      className={`transition-all duration-300 ${
        transitioning
          ? 'opacity-0 translate-y-3'
          : 'opacity-100 translate-y-0'
      }`}
    >
      {children}
    </div>
  );
}