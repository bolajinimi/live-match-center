export default function Loading() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-xl border border-white/10 bg-white/[0.02]" />
      ))}
    </div>
  );
}
