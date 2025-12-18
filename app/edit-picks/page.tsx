"use client";
import { useEffect, useState, type SVGProps } from "react";
import { gql } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";

type Sport = { id: number; title: string };
type Competitor = { id: number; name: string; SportId: number };
type Pick = {
  id: number;
  SportId: number;
  AwayCompetitorId: number;
  HomeCompetitorId: number;
  status: number;
  title: string;
  slug?: string | null;
  matchTime: string;
  analysis: string;
  summary: string;
  isFeatured: boolean | number;
};

const LIST_SPORTS = gql`query { sports { id title } }`;
const LIST_COMPETITORS = gql`query ($sportId: Int) { competitors(sportId: $sportId) { id name SportId } }`;
const LIST_PICKS = gql`
  query ListPicks($limit: Int, $offset: Int, $status: Int, $sportId: Int, $sortBy: String, $sortDir: String) {
    picks(limit: $limit, offset: $offset, status: $status, sportId: $sportId, sortBy: $sortBy, sortDir: $sortDir) {
      id title status matchTime summary analysis slug SportId AwayCompetitorId HomeCompetitorId isFeatured
    }
  }
`;
const UPDATE_PICK = gql`
  mutation UpdatePick(
    $id: ID!, $SportId: Int, $AwayCompetitorId: Int, $HomeCompetitorId: Int, $status: Int, $title: String, $slug: String, $matchTime: Date, $analysis: String, $summary: String, $isFeatured: Boolean
  ) {
    updatePick(id: $id, SportId: $SportId, AwayCompetitorId: $AwayCompetitorId, HomeCompetitorId: $HomeCompetitorId, status: $status, title: $title, slug: $slug, matchTime: $matchTime, analysis: $analysis, summary: $summary, isFeatured: $isFeatured) { id }
  }
`;
const DELETE_PICK = gql`mutation DeletePick($id: ID!) { deletePick(id: $id) }`;

const TrashIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M6 7h12M9 7v10m6-10v10m-9 0a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7m-3-3H9m0 0V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1m-6 0h6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Centralized Apollo client via provider

const STATUS_OPTIONS = [
  { value: 1, label: "NEW" },
  { value: 10, label: "WON" },
  { value: 20, label: "LOST" },
  { value: 30, label: "PUSH" },
  { value: 100, label: "CANCELLED" },
];

export default function EditPicksPage() {
  const client = useApolloClient();

  const [sports, setSports] = useState<Sport[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [items, setItems] = useState<Pick[]>([]);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Pick | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadBase() {
      const { data } = await client.query<{ sports: Sport[] }>({ query: LIST_SPORTS, fetchPolicy: "no-cache" });
      setSports(data?.sports || []);
    }
    loadBase();
  }, [client]);

  useEffect(() => {
    async function loadCompetitors() {
      const sportId = selected?.SportId || null;
      const { data } = await client.query<{ competitors: Competitor[] }>({ query: LIST_COMPETITORS, variables: { sportId }, fetchPolicy: "no-cache" });
      setCompetitors(data?.competitors || []);
    }
    loadCompetitors();
  }, [client, selected?.SportId]);

  useEffect(() => {
    async function loadPicks() {
      const { data } = await client.query<{ picks: Pick[] }>({
        query: LIST_PICKS,
        variables: { limit: 20, offset: page * 20, sortBy: "matchTime", sortDir: "DESC" },
        fetchPolicy: "no-cache",
      });
      setItems(data?.picks || []);
    }
    loadPicks();
  }, [client, page]);

  function sportTitle(id: number) { return sports.find((s) => s.id === id)?.title || String(id); }
  // function competitorName(id: number) { return competitors.find((c) => c.id === id)?.name || String(id); }

  function startEdit(p: Pick) {
    setSelected({ ...p });
  }

  function update<K extends keyof Pick>(key: K, value: Pick[K]) {
    if (!selected) return;
    setSelected({ ...selected, [key]: value });
  }

  async function save() {
    if (!selected) return;
    try {
      setSubmitting(true);
      const editedId = selected.id;
      await client.mutate({
        mutation: UPDATE_PICK,
        variables: {
          id: String(selected.id),
          SportId: Number(selected.SportId),
          AwayCompetitorId: Number(selected.AwayCompetitorId),
          HomeCompetitorId: Number(selected.HomeCompetitorId),
          status: Number(selected.status),
          title: selected.title,
          slug: selected.slug || null,
          matchTime: new Date(selected.matchTime),
          analysis: selected.analysis,
          summary: selected.summary,
          isFeatured: Boolean(selected.isFeatured),
        },
      });
      alert("Saved");
      await refreshCurrentPage(editedId);
    } catch (e) {
      console.error(e);
      alert("Failed to save pick. Ensure you're an admin.");
    } finally {
      setSubmitting(false);
    }
  }

  async function refreshCurrentPage(keepId?: number | null) {
    const { data } = await client.query<{ picks: Pick[] }>({
      query: LIST_PICKS,
      variables: { limit: 20, offset: page * 20, sortBy: "matchTime", sortDir: "DESC" },
      fetchPolicy: "no-cache",
    });
    const refreshed = data?.picks || [];
    setItems(refreshed);
    if (typeof keepId === "number") {
      const updatedItem = refreshed.find((p) => p.id === keepId) || null;
      setSelected(updatedItem);
    } else if (keepId === null) {
      setSelected(null);
    }
  }

  async function deletePick() {
    if (!selected) return;
    const confirmed = window.confirm("Do you want to delete this pick?");
    if (!confirmed) return;
    try {
      setDeleting(true);
      await client.mutate({ mutation: DELETE_PICK, variables: { id: String(selected.id) } });
      alert("Pick deleted");
      await refreshCurrentPage(null);
    } catch (e) {
      console.error(e);
      alert("Failed to delete pick. Ensure you're an admin.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="container mx-auto gutters section-spacing">
      <h1 className="text-3xl font-bold mb-4">Edit Picks</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <h2 className="text-xl font-semibold mb-2">Picks</h2>
          <div className="grid gap-3">
            {items.map((p) => (
              <button
                key={p.id}
                className={`text-left p-3 rounded-lg border shadow-sm bg-white dark:bg-slate-900/40 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors transition-shadow ${selected?.id === p.id ? 'border-primary ring-2 ring-primary bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-700'}`}
                onClick={() => startEdit(p)}
              >
                <div className="font-medium">{p.title}</div>
                <div className="text-sm text-gray-400">{sportTitle(p.SportId)} • #{p.id}</div>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4">
            <button className="btn-secondary" disabled={page === 0} onClick={() => setPage((x) => Math.max(0, x - 1))}>Previous</button>
            <span className="text-sm text-gray-400">Page {page + 1}</span>
            <button className="btn-secondary" onClick={() => setPage((x) => x + 1)}>Next</button>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Edit</h2>
            {selected ? (
              <button
                type="button"
                className="p-2 rounded-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-60"
                onClick={deletePick}
                disabled={submitting || deleting}
                aria-label="Delete pick"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            ) : null}
          </div>
          {!selected ? (
            <div className="text-gray-400">Select a pick to edit.</div>
          ) : (
            <div className="grid gap-4">
              <label className="grid gap-1">
                <span>Sport</span>
                <select className="form-field" value={selected.SportId} onChange={(e) => update("SportId", Number(e.target.value))}>
                  {sports.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="grid gap-1">
                  <span>Home Competitor</span>
                  <select className="form-field" value={selected.HomeCompetitorId} onChange={(e) => update("HomeCompetitorId", Number(e.target.value))}>
                    {competitors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
                <label className="grid gap-1">
                  <span>Away Competitor</span>
                  <select className="form-field" value={selected.AwayCompetitorId} onChange={(e) => update("AwayCompetitorId", Number(e.target.value))}>
                    {competitors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
              </div>

              <label className="grid gap-1">
                <span>Status</span>
                <select className="form-field" value={selected.status} onChange={(e) => update("status", Number(e.target.value))}>
                  {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>

              <label className="grid gap-1">
                <span>Title</span>
                <input className="form-field" value={selected.title} onChange={(e) => update("title", e.target.value)} />
              </label>

              <label className="grid gap-1">
                <span>Pick</span>
                <input className="form-field" value={selected.summary || ""} onChange={(e) => update("summary", e.target.value)} />
              </label>

              <label className="grid gap-1">
                <span>Match Time</span>
                <input type="datetime-local" className="form-field" value={new Date(selected.matchTime).toISOString().slice(0, 16)} onChange={(e) => update("matchTime", e.target.value)} />
              </label>

              <label className="grid gap-1">
                <span>Analysis</span>
                <textarea className="form-field" rows={4} value={selected.analysis} onChange={(e) => update("analysis", e.target.value)} />
              </label>

              <div className="flex gap-2 justify-end">
                <button className="btn-secondary" onClick={() => setSelected(null)} disabled={submitting || deleting}>Cancel</button>
                <button className="btn-primary" onClick={save} disabled={submitting || deleting}>{submitting ? "Saving…" : "Save"}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
