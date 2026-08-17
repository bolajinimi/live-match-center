import { getMatches } from "@/lib/api";
import { MatchList } from "@/components/dashboard/MatchList";

// Always fetch fresh — live scores must never be served from a cached build.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const matches = await getMatches();

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Matches</h1>
        <p className="mt-1 text-sm text-ink-muted">Live scores and fixtures, updated in real time.</p>
      </div>
      <MatchList initialMatches={matches} />
    </div>
  );
}
