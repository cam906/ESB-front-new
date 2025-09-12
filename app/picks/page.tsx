"use client";
import { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import ScoreCardItem from "../components/ScoreCardItem";
import UnlockPickModal from "../components/UnlockPickModal";
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
  cntUnlocked?: number;
};

const LIST_SPORTS = gql`query { sports { id title } }`;
const LIST_PICKS = gql`
  query ListPicks($limit: Int, $offset: Int, $status: Int, $sportId: Int, $sortBy: String, $sortDir: String) {
    picks(limit: $limit, offset: $offset, status: $status, sportId: $sportId, sortBy: $sortBy, sortDir: $sortDir) {
      id title status matchTime summary SportId AwayCompetitorId HomeCompetitorId cntUnlocked
    }
  }
`;
const LIST_UNLOCKED = gql`query Unlocked($userId: ID!) { unlockedPicks(userId: $userId) { PickId } }`;
const GET_COMPETITORS = gql`query Competitors($sportId: Int) { competitors(sportId: $sportId) { id name logo } }`;
const PICKS_COUNT = gql`
  query PicksCount($status: Int, $sportId: Int) { picksCount(status: $status, sportId: $sportId) }
`;

export default function PicksPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useMe();
  const isAdmin = !!user?.roles && (user.roles.includes("ADMIN") || user.roles.includes("SUPERADMIN"));
  const client = useApolloClient();

  const [sports, setSports] = useState<Sport[]>([]);
  const [competitorsById, setCompetitorsById] = useState<Record<number, { id: number; name: string; logo?: string | null }>>({});
  const [picks, setPicks] = useState<Pick[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<number>>(new Set());
  const [userCredits, setUserCredits] = useState<number>(0);
  const [page, setPage] = useState(0);
  // totalPages determines next/prev visibility
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSportId, setSelectedSportId] = useState<number | undefined>(undefined);
  const [sort, setSort] = useState<"ALL" | "LATEST" | "TOP">("ALL");
  const [modal, setModal] = useState<{ open: boolean; pickId?: number }>({ open: false });

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
      const status = 1;
      const pageSize = 20;
      const [{ data }, { data: countData }] = await Promise.all([
        client.query<{ picks: Pick[] }>({
          query: LIST_PICKS,
          variables: {
            limit: pageSize + 1,
            offset: page * pageSize,
            status,
            sportId: selectedSportId,
            sortBy: sort === 'ALL' ? 'id' : (sort === 'TOP' ? 'cntUnlocked' : 'matchTime'),
            sortDir: sort === 'ALL' ? 'ASC' : (sort === 'TOP' ? 'DESC' : 'ASC'),
          },
          fetchPolicy: "no-cache",
        }),
        client.query<{ picksCount: number }>({
          query: PICKS_COUNT,
          variables: { status, sportId: selectedSportId },
          fetchPolicy: "no-cache",
        }),
      ]);
      const items = (data?.picks || []);
      setPicks(items.slice(0, pageSize));
      const total = countData?.picksCount ?? 0;
      setTotalPages(Math.max(1, Math.ceil(total / pageSize)));
      if (!(data?.picks || []).length) {
        // simple toast substitute
        console.info("No data");
      }
    }
    loadPicks();
  }, [client, page, selectedSportId, sort]);

  useEffect(() => {
    async function loadUserExtras() {
      if (!isAuthenticated || !user?.id) return;
      const { data: u } = await client.query<{ unlockedPicks: { PickId: number }[] }>({ query: LIST_UNLOCKED, variables: { userId: String(user.id) }, fetchPolicy: "no-cache" });
      const ids = new Set<number>((u?.unlockedPicks || []).map((x: { PickId: number }) => x.PickId));
      setUnlockedIds(ids);
      setUserCredits(user?.credits ?? 0);
    }
    loadUserExtras();
  }, [client, isAuthenticated, user?.id, user?.credits]);

  function isUnlocked(p: Pick) {
    return isAuthenticated && (isAdmin || unlockedIds.has(+p.id));
  }

  function handleShowUnlocked(pickId: number) {
    router.push(`/pick/${pickId}`);
  }

  function handleUnlock(pickId: number) {
    if (!isAuthenticated) {
      import("aws-amplify/auth").then(({ signInWithRedirect }) => signInWithRedirect());
      return;
    }
    setModal({ open: true, pickId });
  }

  function onUnlocked(pickId: number) {
    console.info("Pick Unlocked!");
    setUnlockedIds((prev) => new Set(prev).add(pickId));
    setTimeout(() => router.push(`/pick/${pickId}`), 300);
  }

  return (
    <div className="container mx-auto gutters section-spacing">
      <div className="flex flex-col md:flex-row gap-6">
        <main className="flex-1">
          <div className="mb-4">
            <h1 className="text-3xl font-bold">Picks</h1>
            <p className="dark:text-gray-400">View our current picks</p>
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
                  // Switching back to a global sort clears sport filter
                  setSelectedSportId(undefined);
                  setSort(val as typeof sort);
                }
              }}
            >
              <option value="ALL">All</option>
              <option value="LATEST">Latest</option>
              <option value="TOP">Top Selling</option>
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
            {picks.map((p) => (
              <ScoreCardItem
                key={p.id}
                pick={{
                  id: p.id,
                  title: p.title,
                  status: p.status,
                  matchTime: p.matchTime,
                  summary: p.summary,
                  cntUnlocked: p.cntUnlocked,
                  HomeCompetitor: competitorsById[p.HomeCompetitorId],
                  AwayCompetitor: competitorsById[p.AwayCompetitorId],
                }}
                isUnlocked={isUnlocked(p)}
                isAdmin={isAdmin}
                onShowUnlocked={handleShowUnlocked}
                onUnlock={handleUnlock}
              />
            ))}
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

      <UnlockPickModal
        open={modal.open}
        credits={userCredits}
        userId={user?.id}
        pickId={modal.pickId}
        onClose={() => setModal({ open: false })}
        onUnlocked={onUnlocked}
      />
    </div>
  );
}


