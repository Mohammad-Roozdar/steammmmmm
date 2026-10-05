'use client';

export default function Timeline({ events = [] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 text-sm">
        فعالیتی ثبت نشده
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#66c0f4] via-[#2a475e] to-transparent" />
      <div className="space-y-4">
        {events.map((e, i) => (
          <div key={i} className="flex gap-4 relative">
            <div className={`w-8 h-8 rounded-full bg-[#171a21] border-2 border-[#2a475e] flex items-center justify-center text-sm z-10 shrink-0 ${e.color}`}>
              {e.icon}
            </div>
            <div className="flex-1 bg-[#0f1922] rounded-xl p-3 hover:bg-[#1a2a3a] transition">
              <div className="flex items-center justify-between gap-2">
                <div className="font-bold text-sm">{e.title}</div>
                <div className="text-xs text-gray-500">
                  {new Date(e.date).toLocaleDateString('fa-IR')}
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-1">{e.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}