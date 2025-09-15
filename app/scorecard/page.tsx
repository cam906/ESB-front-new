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
const PICKS_COUNT = gql`
  query PicksCount($statuses: [Int!], $sportId: Int) { picksCount(statuses: $statuses, sportId: $sportId) }
`;

export default function ScorecardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useMe();
  const isAdmin = !!user?.roles && (user.roles.includes("ADMIN") || user.roles.includes("SUPERADMIN"));

  const client = useApolloClient();

  const [sports, setSports] = useState<Sport[]>([]);
  const [competitorsById, setCompetitorsById] = useState<Record<number, { id: number; name: string; logo?: string | null }>>({});
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  // totalPages determines next/prev visibility
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSportId, setSelectedSportId] = useState<number | undefined>(undefined);
  const [sort, setSort] = useState<"ALL" | "LATEST">("ALL");

  useEffect(() => {
    async function loadBase() {
      setLoading(true);
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
      setLoading(false);
    }
    loadBase();
  }, [client]);

  useEffect(() => {
    async function loadPicks() {
      setLoading(true);
      const statuses = [10, 20, 30, 100];
      const pageSize = 30;
      const [{ data }, { data: countData }] = await Promise.all([
        client.query<{ picks: Pick[] }>({
          query: LIST_PICKS,
          variables: {
            limit: pageSize + 1,
            offset: page * pageSize,
            statuses,
            sportId: selectedSportId,
            sortBy: sort === 'ALL' ? 'id' : 'matchTime',
            sortDir: sort === 'ALL' ? 'DESC' : 'DESC',
          },
          fetchPolicy: "no-cache",
        }),
        client.query<{ picksCount: number }>({
          query: PICKS_COUNT,
          variables: { statuses, sportId: selectedSportId },
          fetchPolicy: "no-cache",
        }),
      ]);
      const items = (data?.picks || []);
      setPicks(items.slice(0, pageSize));
      const total = countData?.picksCount ?? 0;
      setTotalPages(Math.max(1, Math.ceil(total / pageSize)));
      setLoading(false);
    }
    loadPicks();
  }, [client, page, selectedSportId, sort]);

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
            <div className="card p-4 text-center">
              <div className="text-sm text-gray-400">Overall correct</div>
              <div className="text-2xl font-semibold">{overallPct}%</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-sm text-gray-400">Correct this week</div>
              <div className="text-2xl font-semibold">{recentPct}%</div>
            </div>
          </div>

          <div className="flex items-center justify-end mb-4">
            <select
              className="form-field"
              value={selectedSportId ? `SPORT_${selectedSportId}` : sort}
              onChange={(e) => {
                const val = e.target.value;
                setPage(0);
                if (val.startsWith('SPORT_')) {
                  const id = Number(val.replace('SPORT_', ''));
                  setSelectedSportId(Number.isFinite(id) ? id : undefined);
                } else {
                  setSelectedSportId(undefined);
                  setSort(val as typeof sort);
                }
              }}
            >
              <option value="ALL">All</option>
              <option value="LATEST">Latest</option>
              {sports.map((s) => (
                <option key={s.id} value={`SPORT_${s.id}`}>{s.title}</option>
              ))}
            </select>
          </div>

          {/* Top pagination (matching bottom) */}
          <div className="grid grid-cols-3 items-center mb-3">
            <div className="justify-self-start">
              {page > 0 ? (
                <button className="btn-secondary cursor-pointer" onClick={() => setPage((x) => Math.max(0, x - 1))}>Previous</button>
              ) : null}
            </div>
            <div className="justify-self-center">
              <select
                className="form-field cursor-pointer"
                value={page + 1}
                onChange={(e) => setPage(Math.max(0, Math.min(Number(e.target.value) - 1, totalPages - 1)))}
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="justify-self-end">
              {page + 1 < totalPages ? (
                <button className="btn-secondary cursor-pointer" onClick={() => setPage((x) => Math.min(totalPages - 1, x + 1))}>Next</button>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 mb-4">
                    <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <div className="justify-self-center flex flex-col items-center gap-2">
                      <div className="h-20 w-20 bg-gray-300 dark:bg-gray-700" />
                      <div className="h-4 w-28 bg-gray-300 dark:bg-gray-700 rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-40 bg-gray-300 dark:bg-gray-700 rounded" />
                      <div className="h-3 w-56 bg-gray-300 dark:bg-gray-700 rounded" />
                    </div>
                    <div className="justify-self-center flex flex-col items-center gap-2">
                      <div className="h-20 w-20 bg-gray-300 dark:bg-gray-700" />
                      <div className="h-4 w-28 bg-gray-300 dark:bg-gray-700 rounded" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              completedPicks.map((p) => (
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
                    isUnlocked={isAuthenticated}
                    isAdmin={isAdmin}
                    onShowUnlocked={() => handleShowUnlocked(p.id)}
                  />
                </div>
              ))
            )}
          </div>

          <div className="grid grid-cols-3 items-center mt-6">
            <div className="justify-self-start">
              {page > 0 ? (
                <button className="btn-secondary cursor-pointer" onClick={() => setPage((x) => Math.max(0, x - 1))}>Previous</button>
              ) : null}
            </div>
            <div className="justify-self-center">
              <select
                className="form-field cursor-pointer"
                value={page + 1}
                onChange={(e) => setPage(Math.max(0, Math.min(Number(e.target.value) - 1, totalPages - 1)))}
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="justify-self-end">
              {page + 1 < totalPages ? (
                <button className="btn-secondary cursor-pointer" onClick={() => setPage((x) => Math.min(totalPages - 1, x + 1))}>Next</button>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

