export function GameCardSkeleton() {
  return (
    <div className="bg-[#171a21] rounded-xl overflow-hidden border border-[#2a475e] animate-pulse">
      <div className="aspect-[3/4] bg-gradient-to-br from-[#1b2838] to-[#2a475e]" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-[#2a475e] rounded w-3/4" />
        <div className="h-3 bg-[#2a475e] rounded w-1/2" />
        <div className="h-4 bg-[#2a475e] rounded w-1/3 mt-3" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 10 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <GameCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function OrderSkeleton() {
  return (
    <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-4 flex gap-4 animate-pulse">
      <div className="w-16 h-20 bg-[#2a475e] rounded" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[#2a475e] rounded w-1/2" />
        <div className="h-3 bg-[#2a475e] rounded w-1/3" />
      </div>
    </div>
  );
}