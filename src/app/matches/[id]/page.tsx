import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatchById } from "@/lib/api";
import { MatchDetailView } from "@/components/match/MatchDetailView";

export const dynamic = "force-dynamic";

export default async function MatchPage({ params }: { params: { id: string } }) {
  let match;
  try {
    match = await getMatchById(params.id);
  } catch {
    notFound();
  }

  return (
    <div>
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        ← All matches
      </Link>
      <MatchDetailView matchId={params.id} initialMatch={match} />
    </div>
  );
}
