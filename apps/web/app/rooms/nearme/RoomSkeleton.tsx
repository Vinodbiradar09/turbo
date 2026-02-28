export default function RoomSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/60 border border-white/80"
          style={{ opacity: 1 - i * 0.12 }}
        >
          <div className="w-[60px] h-[60px] rounded-[18px] bg-warm animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <div className="h-4 w-36 rounded-full bg-warm animate-pulse" />
              <div className="h-3 w-10 rounded-full bg-warm animate-pulse" />
            </div>
            <div className="h-3 w-48 rounded-full bg-warm/70 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-5 w-16 rounded-full bg-warm/60 animate-pulse" />
              <div className="h-5 w-12 rounded-full bg-warm/40 animate-pulse ml-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
