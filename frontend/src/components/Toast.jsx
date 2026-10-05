'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X, AlertTriangle } from 'lucide-react';

let toastId = 0;
let listeners = [];

export function toast(message, type = 'success') {
  const id = ++toastId;
  listeners.forEach((fn) => fn({ id, message, type }));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const listener = (t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 4000);
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const icons = {
    success: <CheckCircle className="text-green-400" size={22} />,
    error: <XCircle className="text-red-400" size={22} />,
    info: <Info className="text-blue-400" size={22} />,
    warning: <AlertTriangle className="text-yellow-400" size={22} />
  };

  const borders = {
    success: 'border-green-500/50',
    error: 'border-red-500/50',
    info: 'border-blue-500/50',
    warning: 'border-yellow-500/50'
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] space-y-2 w-[90vw] max-w-md">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`bg-[#171a21] border-2 ${borders[t.type]} rounded-xl p-4 flex items-center gap-3 shadow-2xl animate-slide-up`}
        >
          {icons[t.type]}
          <div className="flex-1 text-sm">{t.message}</div>
          <button onClick={() => remove(t.id)} className="text-gray-500 hover:text-white transition">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}