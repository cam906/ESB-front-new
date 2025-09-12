"use client";
import { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import ScoreCardItem from "../components/ScoreCardItem";
import { useMe } from "../lib/useMe";

type Sport = { id: number; title: string };
type Pick = {
  id: number;
  SportId: number;
  AwayCompetitorId: number;
  HomeCompetitorId: number;
  status: number;
  title: string;
  matchTime: string;
  summary: string;
};

const LIST_SPORTS = gql`query { sports { id title } }`;
const LIST_PICKS = gql`
  query ListPicks($limit: Int, $offset: Int, $statuses: [Int!], $sportId: Int, $sortBy: String, $sortDir: String) {
    picks(limit: $limit, offset: $offset, statuses: $statuses, sportId: $sportId, sortBy: $sortBy, sortDir: $sortDir) {
      id title status matchTime summary SportId AwayCompetitorId HomeCompetitorId
    }
  }
`;
const GET_COMPETITORS = gql`query Competitors($sportId: Int) { competitors(sportId: $sportId) { id name logo } }`;

export default function ScorecardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useMe();
  const isAdmin = !!user?.roles && (user.roles.includes("ADMIN") || user.roles.includes("SUPERADMIN"));

  const client = useApolloClient();

  const [sports, setSports] = useState<Sport[]>([]);
  const [competitorsById, setCompetitorsById] = useState<Record<number, { id: number; name: string; logo?: string | null }>>({});
  const [picks, setPicks] = useState<Pick[]>([]);
  const [page, setPage] = useState(0);
  const [selectedSportId, setSelectedSportId] = useState<number | undefined>(undefined);
  const [tab, setTab] = useState<"ALL" | "LATEST">("ALL");

  useEffect(() => {
    async function loadBase() {
      const [{ data: sRes }, { data: cRes }] = await Promise.all([
        client.query<{ sports: Sport[] }>({ query: LIST_SPORTS, fetchPolicy: "no-cache" }),
        client.query<{ competitors: { id: number; name: string; logo?: string | null }[] }>({ query: GET_COMPETITORS, variables: { sportId: null }, fetchPolicy: "no-cache" }),
      ]);
      const s = sRes ?? { sports: [] };
      const c = cRes ?? { competitors: [] };
      setSports(s?.sports || []);
      const map: Record<number, { id: number; name: string; logo?: string | null }> = {};
      for (const comp of (c?.competitors || [])) map[comp.id] = comp;
      setCompetitorsById(map);
    }
    loadBase();
  }, [client]);

  useEffect(() => {
    async function loadPicks() {
      const statuses = [10, 20, 30, 100];
      const { data } = await client.query<{ picks: Pick[] }>({
        query: LIST_PICKS,
        variables: { limit: 30, offset: page * 30, statuses, sportId: selectedSportId, sortBy: "matchTime", sortDir: "DESC" },
        fetchPolicy: "no-cache",
      });
      setPicks((data?.picks || []));
    }
    loadPicks();
  }, [client, page, selectedSportId, tab]);

  function handleShowUnlocked(pickId: number) {
    router.push(`/pick/${pickId}`);
  }

  // Items are already filtered by server to completed statuses
  const completedPicks = picks;

  // Basic client-side stats from currently loaded page
  const totalCompleted = picks.length;
  const totalWon = picks.filter((p) => p.status === 10).length;
  const overallPct = totalCompleted ? Math.round((totalWon / totalCompleted) * 100) : 0;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recent = completedPicks.filter((p) => new Date(p.matchTime) >= sevenDaysAgo);
  const recentWon = recent.filter((p) => p.status === 10).length;
  const recentPct = recent.length ? Math.round((recentWon / recent.length) * 100) : 0;

  return (
    <div className="container mx-auto gutters section-spacing">
      <div className="flex flex-col md:flex-row gap-6">
        <main className="flex-1">
          <div className="mb-4">
            <h1 className="text-3xl font-bold">Scorecard</h1>
            <p className="dark:text-gray-400">View your previous picks and see how you stack up</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="card p-4">
              <div className="text-sm text-gray-400">Overall correct</div>
              <div className="text-2xl font-semibold">{overallPct}%</div>
            </div>
            <div className="card p-4">
              <div className="text-sm text-gray-400">Correct this week</div>
              <div className="text-2xl font-semibold">{recentPct}%</div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="hidden md:flex gap-2">
              <button className={`tab ${tab === 'ALL' ? 'tab-active' : ''}`} onClick={() => setTab('ALL')}>All</button>
              <button className={`tab ${tab === 'LATEST' ? 'tab-active' : ''}`} onClick={() => setTab('LATEST')}>Latest</button>
            </div>
            <select
              className="form-field"
              value={selectedSportId ?? ''}
              onChange={(e) => setSelectedSportId(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">All</option>
              <option value="__latest" disabled>Latest</option>
              {sports.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4">
            {completedPicks.map((p) => (
              <div key={p.id} className="flex flex-col gap-2">
                <ScoreCardItem
                  pick={{
                    id: p.id,
                    title: p.title,
                    status: p.status,
                    matchTime: p.matchTime,
                    summary: p.summary,
                    HomeCompetitor: competitorsById[p.HomeCompetitorId],
                    AwayCompetitor: competitorsById[p.AwayCompetitorId],
                  }}
                  isUnlocked={true}
                  isAdmin={isAdmin}
                  hideButtons={true}
                />
                <div>
                  {isAuthenticated ? (
                    <button className="btn-primary" onClick={() => handleShowUnlocked(p.id)}>Show unlocked pick</button>
                  ) : (
                    <button className="btn-secondary" onClick={() => import('aws-amplify/auth').then(({ signInWithRedirect }) => signInWithRedirect())}>Log In to check options available</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6">
            <button className="btn-secondary" disabled={page === 0} onClick={() => setPage((x) => Math.max(0, x - 1))}>Previous</button>
            <span className="text-sm text-gray-400">Page {page + 1}</span>
            <button className="btn-secondary" onClick={() => setPage((x) => x + 1)}>Next</button>
          </div>
        </main>
      </div>
    </div>
  );
}

