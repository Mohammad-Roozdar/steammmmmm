'use client';

export default function Heatmap({ data = {} }) {
  const weeks = 26; // ۶ ماه
  const days = 7;

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - weeks * 7);

  const getLevel = (count) => {
    if (!count) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count <= 4) return 3;
    return 4;
  };

  const colors = [
    'bg-[#0f1922]',
    'bg-[#66c0f4]/30',
    'bg-[#66c0f4]/60',
    'bg-[#66c0f4]/80',
    'bg-[#66c0f4]'
  ];

  const cells = [];
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < days; d++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + w * 7 + d);
      const key = date.toISOString().split('T')[0];
      const count = data[key] || 0;
      cells.push({
        key,
        count,
        level: getLevel(count),
        date
      });
    }
  }

  // گروه‌بندی بر اساس هفته
  const weeksData = [];
  for (let w = 0; w < weeks; w++) {
    weeksData.push(cells.slice(w * 7, (w + 1) * 7));
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {weeksData.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((cell) => (
              <div
                key={cell.key}
                title={`${cell.date.toLocaleDateString('fa-IR')}: ${cell.count} فعالیت`}
                className={`w-3 h-3 rounded-sm ${colors[cell.level]} transition hover:scale-150 hover:z-10`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 mt-3 text-xs text-gray-500">
        <span>کم</span>
        {colors.map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span>زیاد</span>
      </div>
    </div>
  );
}