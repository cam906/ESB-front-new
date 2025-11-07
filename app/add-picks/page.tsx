"use client";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { gql, type ApolloClient } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";
import { useRouter } from "next/navigation";

type Sport = { id: number; title: string };
type Competitor = { id: number; name: string; SportId: number };

const LIST_SPORTS = gql`query { sports { id title } }`;
const LIST_COMPETITORS = gql`query ($sportId: Int) { competitors(sportId: $sportId) { id name SportId logo } }`;
const CREATE_COMPETITOR = gql`
  mutation CreateCompetitor($SportId: Int!, $name: String!, $logo: String) {
    createCompetitor(SportId: $SportId, name: $name, logo: $logo) { id name SportId logo }
  }
`;
const CREATE_PICK = gql`
  mutation CreatePick(
    $SportId: Int!, $AwayCompetitorId: Int!, $HomeCompetitorId: Int!, $status: Int!, $title: String!, $slug: String, $matchTime: Date!, $analysis: String!, $summary: String!, $isFeatured: Boolean
  ) {
    createPick(
      SportId: $SportId, AwayCompetitorId: $AwayCompetitorId, HomeCompetitorId: $HomeCompetitorId, status: $status, title: $title, slug: $slug, matchTime: $matchTime, analysis: $analysis, summary: $summary, isFeatured: $isFeatured
    ) { id }
  }
`;

// Centralized Apollo client via provider

const STATUS_OPTIONS = [
  { value: 1, label: "NEW" },
  { value: 10, label: "WON" },
  { value: 20, label: "LOST" },
  { value: 30, label: "PUSH" },
  { value: 100, label: "CANCELLED" },
];

export default function AddPicksPage() {
  const client = useApolloClient();
  const router = useRouter();

  const [sports, setSports] = useState<Sport[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [form, setForm] = useState({
    SportId: 2,
    HomeCompetitorId: 0,
    AwayCompetitorId: 0,
    status: 1,
    title: "",
    slug: "",
    matchAt: null as Date | null,
    analysis: "",
    summary: "",
    isFeatured: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showAddCompetitor, setShowAddCompetitor] = useState<"home" | "away" | null>(null);

  useEffect(() => {
    async function loadSports() {
      const { data } = await client.query<{ sports: Sport[] }>({ query: LIST_SPORTS, fetchPolicy: "no-cache" });
      setSports(data?.sports || []);
    }
    loadSports();
  }, [client]);

  useEffect(() => {
    async function loadCompetitors() {
      const sportId = form.SportId || null;
      const { data } = await client.query<{ competitors: Competitor[] }>({ query: LIST_COMPETITORS, variables: { sportId }, fetchPolicy: "no-cache" });
      setCompetitors(data?.competitors || []);
    }
    loadCompetitors();
  }, [client, form.SportId]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.SportId || !form.HomeCompetitorId || !form.AwayCompetitorId || !form.title || !form.matchAt) {
      alert("Please fill all required fields");
      return;
    }
    try {
      setSubmitting(true);
      await client.mutate({
        mutation: CREATE_PICK,
        variables: {
          SportId: Number(form.SportId),
          HomeCompetitorId: Number(form.HomeCompetitorId),
          AwayCompetitorId: Number(form.AwayCompetitorId),
          status: Number(form.status),
          title: form.title,
          slug: form.slug || null,
          matchTime: form.matchAt,
          analysis: form.analysis,
          summary: form.summary,
          isFeatured: Boolean(form.isFeatured),
        },
      });
      alert("Pick created");
      router.push("/edit-picks");
    } catch (e) {
      console.error(e);
      alert("Failed to create pick. Ensure you're an admin and inputs are valid.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto gutters section-spacing">
      <h1 className="text-3xl font-bold mb-4">Add Pick</h1>
      <form className="card p-6 grid gap-4" onSubmit={onSubmit}>
        <label className="grid gap-1">
          <span>Sport</span>
          <select className="form-field" value={form.SportId || ""} onChange={(e) => update("SportId", Number(e.target.value))} required>
            <option value="" disabled>Select sport</option>
            {sports.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="grid gap-1">
            <span className="inline-flex items-center gap-2">
              <span>Home Competitor</span>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-green-600 to-emerald-500 text-white w-8 h-8 text-base shadow-md ring-1 ring-white/20 hover:shadow-lg hover:scale-105 transition"
                title="Add competitor"
                aria-label="Add home competitor"
                onClick={() => setShowAddCompetitor("home")}
              >
                +
              </button>
            </span>
            <select className="form-field" value={form.HomeCompetitorId || ""} onChange={(e) => update("HomeCompetitorId", Number(e.target.value))} required>
              <option value="" disabled>Select home competitor</option>
              {competitors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="inline-flex items-center gap-2">
              <span>Away Competitor</span>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-green-600 to-emerald-500 text-white w-8 h-8 text-base shadow-md ring-1 ring-white/20 hover:shadow-lg hover:scale-105 transition"
                title="Add competitor"
                aria-label="Add away competitor"
                onClick={() => setShowAddCompetitor("away")}
              >
                +
              </button>
            </span>
            <select className="form-field" value={form.AwayCompetitorId || ""} onChange={(e) => update("AwayCompetitorId", Number(e.target.value))} required>
              <option value="" disabled>Select away competitor</option>
              {competitors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        </div>

        <label className="grid gap-1">
          <span>Status</span>
          <select className="form-field" value={form.status} onChange={(e) => update("status", Number(e.target.value))} required>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>

        <label className="grid gap-1">
          <span>Title</span>
          <input className="form-field" value={form.title} onChange={(e) => update("title", e.target.value)} required />
        </label>

        <label className="grid gap-1">
          <span>Pick</span>
          <input className="form-field" value={form.slug} onChange={(e) => update("slug", e.target.value)} />
        </label>

        <label className="grid gap-1">
          <span>Match Time</span>
          <DatePicker
            selected={form.matchAt}
            onChange={(date) => update("matchAt", date as Date)}
            showTimeSelect
            timeIntervals={15}
            dateFormat="Pp"
            className="form-field"
            placeholderText="Select date and time"
          />
        </label>

        <label className="grid gap-1">
          <span>Analysis</span>
          <textarea className="form-field" rows={4} value={form.analysis} onChange={(e) => update("analysis", e.target.value)} required />
        </label>

        <div className="flex gap-2 justify-end">
          <button type="button" className="btn-secondary" onClick={() => router.back()} disabled={submitting}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? "Saving…" : "Create"}</button>
        </div>
      </form>
      <AddCompetitorModal
        open={Boolean(showAddCompetitor)}
        sportId={form.SportId}
        onClose={() => setShowAddCompetitor(null)}
        onCreated={async (created) => {
          // Refresh list then select created as Home/Away depending on which button opened the modal
          const target = showAddCompetitor;
          const sportId = form.SportId || null;
          const { data } = await client.query<{ competitors: Competitor[] }>({ query: LIST_COMPETITORS, variables: { sportId }, fetchPolicy: "no-cache" });
          setCompetitors(data?.competitors || []);
          if (target === "home") update("HomeCompetitorId", created.id); else update("AwayCompetitorId", created.id);
          setShowAddCompetitor(null);
        }}
        client={client}
      />
    </div>
  );
}


type AddCompetitorModalProps = {
  open: boolean;
  sportId: number;
  onClose: () => void;
  onCreated: (competitor: { id: number; name: string; SportId: number; logo?: string | null }) => void;
  client: ApolloClient;
};

function AddCompetitorModal({ open, sportId, onClose, onCreated, client }: AddCompetitorModalProps) {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function getPresignedUrl(params: { fileName: string; fileType: string; folder?: string }) {
    const res = await fetch("/api/s3/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Failed to get presigned URL");
    return res.json() as Promise<{ url: string; key: string }>;
  }

  async function uploadToS3(url: string, fileToUpload: File) {
    const res = await fetch(url, { method: "PUT", body: fileToUpload, headers: { "Content-Type": fileToUpload.type } });
    if (!res.ok) throw new Error("Upload failed");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) { setError("Name is required"); return; }
    try {
      setSubmitting(true);
      let logoKey: string | undefined = undefined;
      if (file) {
        const { url, key } = await getPresignedUrl({ fileName: file.name, fileType: file.type, folder: "competitors/" });
        await uploadToS3(url, file);
        // Store only the key; UI composes URL via NEXT_PUBLIC_ESB_COMPETITOR_ASSETS
        logoKey = key;
      }
      const { data } = await client.mutate<{ createCompetitor: { id: number; name: string; SportId: number; logo?: string | null } }>({
        mutation: CREATE_COMPETITOR,
        variables: { SportId: Number(sportId), name: name.trim(), logo: logoKey },
      });
      const created = data?.createCompetitor;
      if (created) {
        onCreated(created);
        setName("");
        setFile(null);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to create competitor");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="card p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Add Competitor</h3>
          <button
            className="inline-flex items-center justify-center rounded-full bg-slate-800 text-white w-10 h-10 text-2xl font-bold shadow-md hover:bg-slate-700 active:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label="Close"
            onClick={onClose}
            disabled={submitting}
          >
            ×
          </button>
        </div>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-1">
            <span>Name</span>
            <input className="form-field" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="grid gap-1">
            <span>Logo (optional)</span>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <span className="text-xs text-gray-500">JPEG/PNG/SVG up to 5MB</span>
          </label>
          {error ? <div className="text-error text-sm">{error}</div> : null}
          <div className="flex gap-2 justify-end">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? "Saving…" : "Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

