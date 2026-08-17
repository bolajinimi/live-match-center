import { getMatches } from "@/lib/api";
import { MatchList } from "@/components/dashboard/MatchList";

// Always fetch fresh — live scores must never be served from a cached build.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const matches = await getMatches();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Matches</h1>
      <MatchList initialMatches={matches} />
    </div>
  );
}
