'use client';
import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);
  const [hidden, setHidden] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // غیرفعال روی موبایل
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsMobile(true);
      return;
    }

    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!cursor || !dot) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let dotX = 0;
    let dotY = 0;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setHidden(false);
    };

    const onDown = () => setClicked(true);
    const onUp = () => setClicked(false);
    const onLeave = () => setHidden(true);

    const onHoverStart = (e) => {
      const target = e.target;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.getAttribute('role') === 'button'
      ) {
        setHovered(true);
      } else {
        setHovered(false);
      }
    };

    const animate = () => {
      // حلقه cursor
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      // dot مستقیم
      dotX += (mouseX - dotX) * 0.6;
      dotY += (mouseY - dotY) * 0.6;

      if (cursor) cursor.style.transform = `translate(${cursorX - 20}px, ${cursorY - 20}px)`;
      if (dot) dot.style.transform = `translate(${dotX - 4}px, ${dotY - 4}px)`;

      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('mouseover', onHoverStart);
    animate();

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mouseover', onHoverStart);
    };
  }, []);

  if (isMobile) return null;

  return (
    <>
      <style jsx global>{`
        @media (pointer: fine) {
          body, a, button, input, textarea, select {
            cursor: none !important;
          }
        }
      `}</style>

      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 w-10 h-10 rounded-full pointer-events-none z-[9998] transition-all duration-200 ${
          hidden ? 'opacity-0' : 'opacity-100'
        } ${
          clicked ? 'scale-75' : ''
        } ${
          hovered ? 'scale-150 bg-[#66c0f4]/20 border-2 border-[#66c0f4]' : 'border-2 border-[#66c0f4]/50'
        }`}
        style={{ willChange: 'transform' }}
      />

      <div
        ref={dotRef}
        className={`fixed top-0 left-0 w-2 h-2 rounded-full bg-[#66c0f4] pointer-events-none z-[9999] transition-opacity ${
          hidden ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ willChange: 'transform' }}
      />
    </>
  );
}