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
  const [loading, setLoading] = useState(true);
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
      setPicks(items.slice(0, pageSize).map(p => ({ ...p, id: Number(p.id) })));
      const total = countData?.picksCount ?? 0;
      setTotalPages(Math.max(1, Math.ceil(total / pageSize)));
      if (!(data?.picks || []).length) {
        // simple toast substitute
        console.info("No data");
      }
      setLoading(false);
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
    return isAuthenticated && (isAdmin || unlockedIds.has(p.id));
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
    try {
      triggerConfettiFromCard(pickId);
    } catch (e) {
      console.warn('Confetti failed', e);
    }
    setTimeout(() => {
      setUnlockedIds((prev) => new Set(prev).add(pickId));
    }, 1000);
  }

  function ensureConfettiStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('confetti-styles')) return;
    const style = document.createElement('style');
    style.id = 'confetti-styles';
    style.textContent = `
      @keyframes confetti-fall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(120px) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  function triggerConfettiFromCard(pickId: number) {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;
    ensureConfettiStyles();
    const el = document.getElementById(`pick-card-${pickId}`);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const startY = Math.max(0, rect.top - 8);

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '100%';
    container.style.height = '0';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';

    const colors = ['#22c55e', '#fde047', '#3b82f6', '#ef4444', '#a855f7'];
    const count = 60;
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      const size = 6 + Math.random() * 8;
      const startX = rect.left + 8 + Math.random() * Math.max(0, rect.width - 16);
      piece.style.position = 'fixed';
      piece.style.left = `${startX}px`;
      piece.style.top = `${startY}px`;
      piece.style.width = `${size}px`;
      piece.style.height = `${size * (0.5 + Math.random() * 1.2)}px`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.transform = 'translate(0px, 0px) rotate(0deg)';
      piece.style.opacity = '1';
      piece.style.borderRadius = Math.random() > 0.5 ? '2px' : '50%';
      piece.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.05)';
      // trigger animation
      requestAnimationFrame(() => {
        const driftX = (Math.random() - 0.5) * 160;
        const fallY = rect.height + 160 + Math.random() * 100;
        piece.style.transition = 'transform 1100ms cubic-bezier(0.2,0.6,0.2,1), opacity 1100ms linear';
        piece.style.transform = `translate(${driftX}px, ${fallY}px) rotate(${Math.random() * 1080}deg)`;
        piece.style.opacity = '0';
      });
      container.appendChild(piece);
    }

    document.body.appendChild(container);
    window.setTimeout(() => {
      container.remove();
    }, 1200);
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
              picks.map((p) => (
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


