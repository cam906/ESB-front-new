"use client";
import { useEffect, useMemo, useState } from "react";
import { ApolloClient, InMemoryCache, gql, HttpLink } from "@apollo/client";
import { useRouter } from "next/navigation";
import ScoreCardItem from "../components/ScoreCardItem";
import UnlockPickModal from "../components/UnlockPickModal";
import { useAuth } from "../lib/useAuth";

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
  query ListPicks($limit: Int, $offset: Int, $status: Int, $sportId: Int, $sortBy: String, $sortDir: String) {
    picks(limit: $limit, offset: $offset, status: $status, sportId: $sportId, sortBy: $sortBy, sortDir: $sortDir) {
      id title status matchTime summary SportId AwayCompetitorId HomeCompetitorId
    }
  }
`;
const LIST_UNLOCKED = gql`query Unlocked($userId: ID!) { unlockedPicks(userId: $userId) { PickId } }`;
const GET_COMPETITORS = gql`query Competitors($sportId: Int) { competitors(sportId: $sportId) { id name logo } }`;
const UNLOCK_PICK = gql`mutation Unlock($userId: ID!, $pickId: ID!) { unlockPick(userId: $userId, pickId: $pickId) { id } }`;

function createClient() {
  return new ApolloClient({
    link: new HttpLink({ uri: "/api/graphql", credentials: "same-origin" }),
    cache: new InMemoryCache(),
  });
}

export default function PicksPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = !!user?.role && user.role.includes("admin");

  const client = useMemo(() => createClient(), []);

  const [sports, setSports] = useState<Sport[]>([]);
  const [competitorsById, setCompetitorsById] = useState<Record<number, { id: number; name: string; logo?: string | null }>>({});
  const [picks, setPicks] = useState<Pick[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<number>>(new Set());
  const [userCredits, setUserCredits] = useState<number>(0);
  const [page, setPage] = useState(0);
  const [selectedSportId, setSelectedSportId] = useState<number | undefined>(undefined);
  const [tab, setTab] = useState<"ALL" | "LATEST">("ALL");
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
      const status = tab === "LATEST" ? 0 : undefined; // new picks only for Latest
      const { data } = await client.query<{ picks: Pick[] }>({
        query: LIST_PICKS,
        variables: { limit: 20, offset: page * 20, status, sportId: selectedSportId, sortBy: "matchTime", sortDir: "ASC" },
        fetchPolicy: "no-cache",
      });
      setPicks((data?.picks || []));
      if (!(data?.picks || []).length) {
        // simple toast substitute
        console.info("No data");
      }
    }
    loadPicks();
  }, [client, page, selectedSportId, tab]);

  useEffect(() => {
    async function loadUserExtras() {
      if (!isAuthenticated || !user?.id) return;
      const [{ data: u }, meRes] = await Promise.all([
        client.query<{ unlockedPicks: { PickId: number }[] }>({ query: LIST_UNLOCKED, variables: { userId: String(user.id) }, fetchPolicy: "no-cache" }),
        fetch("/api/me", { credentials: "include", cache: "no-store" }).then((r) => r.ok ? r.json() : null),
      ]);
      const ids = new Set<number>((u?.unlockedPicks || []).map((x: { PickId: number }) => x.PickId));
      setUnlockedIds(ids);
      setUserCredits(meRes?.credits ?? 0);
    }
    loadUserExtras();
  }, [client, isAuthenticated, user?.id]);

  function isUnlocked(p: Pick) {
    return isAuthenticated && (isAdmin || unlockedIds.has(p.id));
  }

  function handleShowUnlocked(pickId: number) {
    router.push(`/pick/${pickId}`);
  }

  function handleUnlock(pickId: number) {
    if (!isAuthenticated) {
      router.push("/signin");
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
        <aside className="hidden md:block md:w-64">
          <div className='Bet365Component iframe-container card p-0 overflow-hidden'>
            <iframe
              title='Bet365'
              src='https://imstore.bet365affiliates.com/365_455806-449-32-6-149-1-88420.aspx'
              frameBorder='0'
              scrolling='no'
              className="w-full h-80"
            ></iframe>
          </div>
        </aside>
        <main className="flex-1">
          <div className="mb-4">
            <h1 className="text-3xl font-bold">Picks</h1>
            <p className="dark:text-gray-400">View our current picks</p>
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
            {picks.map((p) => (
              <ScoreCardItem
                key={p.id}
                pick={{
                  id: p.id,
                  title: p.title,
                  status: p.status,
                  matchTime: p.matchTime,
                  summary: p.summary,
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

          <div className="flex items-center justify-between mt-6">
            <button className="btn-secondary" disabled={page === 0} onClick={() => setPage((x) => Math.max(0, x - 1))}>Previous</button>
            <span className="text-sm text-gray-400">Page {page + 1}</span>
            <button className="btn-secondary" onClick={() => setPage((x) => x + 1)}>Next</button>
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


