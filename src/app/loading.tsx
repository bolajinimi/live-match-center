export default function Loading() {
  return (
    <div>
      <div className="mb-7 space-y-2">
        <div className="skeleton h-7 w-32 animate-shimmer rounded-lg" />
        <div className="skeleton h-4 w-56 animate-shimmer rounded-lg" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-28 animate-shimmer rounded-2xl border border-border" />
        ))}
      </div>
    </div>
  );
}
