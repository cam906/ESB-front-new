"use client";
import { useEffect, useMemo, useState } from "react";
import { ApolloClient, gql, HttpLink, InMemoryCache } from "@apollo/client";

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

function createClient() {
  return new ApolloClient({ link: new HttpLink({ uri: "/api/graphql", credentials: "same-origin" }), cache: new InMemoryCache() });
}

const STATUS_OPTIONS = [
  { value: 1, label: "NEW" },
  { value: 10, label: "WON" },
  { value: 20, label: "LOST" },
  { value: 30, label: "PUSH" },
  { value: 100, label: "CANCELLED" },
];

export default function EditPicksPage() {
  const client = useMemo(() => createClient(), []);

  const [sports, setSports] = useState<Sport[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [items, setItems] = useState<Pick[]>([]);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Pick | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
  function competitorName(id: number) { return competitors.find((c) => c.id === id)?.name || String(id); }

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
      // refresh list and keep the same pick selected
      const { data } = await client.query<{ picks: Pick[] }>({ query: LIST_PICKS, variables: { limit: 20, offset: page * 20, sortBy: "matchTime", sortDir: "DESC" }, fetchPolicy: "no-cache" });
      const refreshed = data?.picks || [];
      setItems(refreshed);
      const updatedItem = refreshed.find((p) => p.id === editedId) || null;
      if (updatedItem) setSelected(updatedItem);
    } catch (e) {
      console.error(e);
      alert("Failed to save pick. Ensure you're an admin.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto gutters section-spacing">
      <h1 className="text-3xl font-bold mb-4">Edit Picks</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <h2 className="text-xl font-semibold mb-2">Picks</h2>
          <div className="grid gap-2">
            {items.map((p) => (
              <button key={p.id} className={`text-left p-2 rounded border ${selected?.id === p.id ? 'border-primary' : 'border-gray-700'}`} onClick={() => startEdit(p)}>
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
          <h2 className="text-xl font-semibold mb-2">Edit</h2>
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
                <span>Slug</span>
                <input className="form-field" value={selected.slug || ""} onChange={(e) => update("slug", e.target.value)} />
              </label>

              <label className="grid gap-1">
                <span>Match Time</span>
                <input type="datetime-local" className="form-field" value={new Date(selected.matchTime).toISOString().slice(0, 16)} onChange={(e) => update("matchTime", e.target.value)} />
              </label>

              <label className="grid gap-1">
                <span>Analysis</span>
                <textarea className="form-field" rows={4} value={selected.analysis} onChange={(e) => update("analysis", e.target.value)} />
              </label>

              <label className="grid gap-1">
                <span>Summary</span>
                <textarea className="form-field" rows={2} value={selected.summary} onChange={(e) => update("summary", e.target.value)} />
              </label>

              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={Boolean(selected.isFeatured)} onChange={(e) => update("isFeatured", e.target.checked)} />
                <span>Featured</span>
              </label>

              <div className="flex gap-2 justify-end">
                <button className="btn-secondary" onClick={() => setSelected(null)} disabled={submitting}>Cancel</button>
                <button className="btn-primary" onClick={save} disabled={submitting}>{submitting ? "Saving…" : "Save"}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


