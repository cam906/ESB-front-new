"use client";
import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ApolloClient, gql, HttpLink, InMemoryCache } from "@apollo/client";
import { useRouter } from "next/navigation";

type Sport = { id: number; title: string };
type Competitor = { id: number; name: string; SportId: number };

const LIST_SPORTS = gql`query { sports { id title } }`;
const LIST_COMPETITORS = gql`query ($sportId: Int) { competitors(sportId: $sportId) { id name SportId } }`;
const CREATE_PICK = gql`
  mutation CreatePick(
    $SportId: Int!, $AwayCompetitorId: Int!, $HomeCompetitorId: Int!, $status: Int!, $title: String!, $slug: String, $matchTime: Date!, $analysis: String!, $summary: String!, $isFeatured: Boolean
  ) {
    createPick(
      SportId: $SportId, AwayCompetitorId: $AwayCompetitorId, HomeCompetitorId: $HomeCompetitorId, status: $status, title: $title, slug: $slug, matchTime: $matchTime, analysis: $analysis, summary: $summary, isFeatured: $isFeatured
    ) { id }
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

export default function AddPicksPage() {
  const client = useMemo(() => createClient(), []);
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
            <span>Home Competitor</span>
            <select className="form-field" value={form.HomeCompetitorId || ""} onChange={(e) => update("HomeCompetitorId", Number(e.target.value))} required>
              <option value="" disabled>Select home competitor</option>
              {competitors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1">
            <span>Away Competitor</span>
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
          <span>Slug</span>
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

        <label className="grid gap-1">
          <span>Summary</span>
          <textarea className="form-field" rows={2} value={form.summary} onChange={(e) => update("summary", e.target.value)} required />
        </label>

        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => update("isFeatured", e.target.checked)} />
          <span>Featured</span>
        </label>

        <div className="flex gap-2 justify-end">
          <button type="button" className="btn-secondary" onClick={() => router.back()} disabled={submitting}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? "Saving…" : "Create"}</button>
        </div>
      </form>
    </div>
  );
}


