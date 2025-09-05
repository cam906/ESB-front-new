"use client";
import { useEffect, useMemo, useState } from "react";
import { ApolloClient, InMemoryCache, gql, HttpLink } from "@apollo/client";
import { useAuth } from "@/app/lib/useAuth";

type Purchase = {
  id: number;
  credits: number;
  priceInCents: number | null;
  createdAt: string;
  user?: { name: string; email: string } | null;
  package?: { title: string; description: string; credits: number; priceInCents: number } | null;
};

type PurchasesResponse = {
  creditPurchases: {
    items: Purchase[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

const LIST_PURCHASES = gql`
  query ListPurchases($limit: Int, $offset: Int, $userId: Int) {
    creditPurchases(limit: $limit, offset: $offset, userId: $userId) {
      items {
        id
        credits
        priceInCents
        createdAt
        user { name email }
        package { title description credits priceInCents }
      }
      totalCount
      page
      pageSize
      totalPages
    }
  }
`;

function createClient() {
  return new ApolloClient({
    link: new HttpLink({ uri: "/api/graphql", credentials: "same-origin" }),
    cache: new InMemoryCache(),
  });
}

export default function PurchaseHistoryPage() {
  const { user, isLoading } = useAuth();
  const isAdmin = !!user?.role && user.role.includes("ADMIN");

  const client = useMemo(() => createClient(), []);

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  useEffect(() => {
    async function loadPurchases() {
      if (isLoading) return;
      setIsFetching(true);
      try {
        const offset = (page - 1) * pageSize;
        const userId = isAdmin ? undefined : (user?.id ? Number(user.id) : undefined);
        const { data } = await client.query<PurchasesResponse>({
          query: LIST_PURCHASES,
          variables: { limit: pageSize, offset, userId },
          fetchPolicy: "no-cache",
        });
        const payload = data?.creditPurchases;
        setPurchases(payload?.items || []);
        setTotalPages(payload?.totalPages || 1);
      } finally {
        setIsFetching(false);
      }
    }
    loadPurchases();
  }, [client, isAdmin, isLoading, page, pageSize, user]);

  function formatPrice(cents?: number | null) {
    if (typeof cents !== "number") return "$0.00";
    return `$${(cents / 100).toFixed(2)}`;
  }

  const showAdminCols = isAdmin;

  return (
    <div className="container mx-auto gutters section-spacing">
      <h1 className="text-3xl font-bold mb-4">Purchase History</h1>

      <div className="card p-0 overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              {showAdminCols && <th className="text-left p-3">Name</th>}
              {showAdminCols && <th className="text-left p-3">Email</th>}
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Description</th>
              <th className="text-left p-3">Credits</th>
              <th className="text-left p-3">Price</th>
              <th className="text-left p-3">Created</th>
              <th className="text-left p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 && !isFetching && (
              <tr>
                <td colSpan={showAdminCols ? 8 : 6} className="p-6 text-center text-gray-400">
                  No data available to display!
                </td>
              </tr>
            )}
            {purchases.map((p) => {
              const pkg = p.package || null;
              const credits = pkg?.credits ?? p.credits;
              const price = typeof p.priceInCents === "number" ? p.priceInCents : pkg?.priceInCents;
              return (
                <tr key={p.id} className="border-t border-gray-800">
                  {showAdminCols && <td className="p-3">{p.user?.name || "-"}</td>}
                  {showAdminCols && <td className="p-3">{p.user?.email || "-"}</td>}
                  <td className="p-3">{pkg?.title || "-"}</td>
                  <td className="p-3">{pkg?.description || "-"}</td>
                  <td className="p-3">{credits}</td>
                  <td className="p-3">{formatPrice(price ?? null)}</td>
                  <td className="p-3">{new Date(p.createdAt).toLocaleString()}</td>
                  <td className="p-3">-</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 gap-4">
        <div className="flex items-center gap-2">
          <button
            className="btn-secondary"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <button
            className="btn-secondary"
            disabled={page >= totalPages || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
        <div className="text-sm text-gray-400">
          Page {page} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Page size</label>
          <select
            className="form-field"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  );
}

