export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/[0.02]" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-xl border border-white/10 bg-white/[0.02]" />
        <div className="h-64 animate-pulse rounded-xl border border-white/10 bg-white/[0.02]" />
      </div>
    </div>
  );
}
