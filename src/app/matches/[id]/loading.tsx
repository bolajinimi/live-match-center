export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-8 w-24 animate-shimmer rounded-lg" />
      <div className="skeleton h-40 animate-shimmer rounded-2xl border border-border" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="skeleton h-64 animate-shimmer rounded-2xl border border-border" />
        <div className="skeleton h-64 animate-shimmer rounded-2xl border border-border" />
      </div>
      <div className="skeleton h-64 animate-shimmer rounded-2xl border border-border" />
    </div>
  );
}
