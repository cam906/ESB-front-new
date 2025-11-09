"use client";

import { useEffect, useMemo, useState } from "react";
import { gql } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useMe } from "@/app/lib/useMe";

const PAGE_SIZE = 10;

const LIST_USERS = gql`
  query AdminUsers($limit: Int, $offset: Int) {
    users(limit: $limit, offset: $offset) {
      id
      name
      email
      createdAt
    }
  }
`;

const LIST_PURCHASES = gql`
  query AdminPurchases($limit: Int, $offset: Int) {
    creditPurchases(limit: $limit, offset: $offset) {
      items {
        id
        createdAt
        priceInCents
        user { id name email }
        package { title }
      }
      totalPages
      page
    }
  }
`;

const LIST_UNLOCKED = gql`
  query AdminUnlocked($limit: Int, $offset: Int) {
    unlockedPicksAdmin(limit: $limit, offset: $offset) {
      items {
        id
        createdAt
        user { id name email }
        pick { id title matchTime }
      }
      page
      totalPages
    }
  }
`;

const MONTHLY_REVENUE = gql`
  query MonthlyRevenue {
    monthlyRevenuePastYear {
      monthStart
      label
      totalCents
    }
  }
`;

type AdminUser = {
  id: number;
  name?: string | null;
  email: string;
  createdAt: string;
};

type Purchase = {
  id: number;
  createdAt: string;
  priceInCents?: number | null;
  user?: { id: number; name?: string | null; email: string } | null;
  package?: { title: string | null } | null;
};

type UnlockedPickRow = {
  id: number;
  createdAt: string;
  user?: { id: number; name?: string | null; email: string } | null;
  pick?: { id: number; title: string; matchTime: string } | null;
};

type MonthlyRevenuePoint = {
  monthStart: string;
  label: string;
  totalCents: number;
};

function formatDate(value?: string | null, withTime = true) {
  if (!value) return "-";
  const dt = new Date(value);
  return withTime ? dt.toLocaleString() : dt.toLocaleDateString();
}

function formatCurrency(cents?: number | null) {
  const dollars = typeof cents === "number" ? cents / 100 : 0;
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(dollars);
}

function formatCurrencyCompact(cents: number) {
  const dollars = cents / 100;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(dollars);
}

export default function AdminPage() {
  const { user, loading } = useMe();
  const client = useApolloClient();
  const isAdmin = !!user?.roles && (user.roles.includes("ADMIN") || user.roles.includes("SUPERADMIN"));

  const [customerPage, setCustomerPage] = useState(0);
  const [customers, setCustomers] = useState<AdminUser[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersHasMore, setCustomersHasMore] = useState(false);

  const [purchasePage, setPurchasePage] = useState(1);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [purchaseTotalPages, setPurchaseTotalPages] = useState(1);
  const [purchasesLoading, setPurchasesLoading] = useState(false);

  const [unlockedPage, setUnlockedPage] = useState(1);
  const [unlockedRows, setUnlockedRows] = useState<UnlockedPickRow[]>([]);
  const [unlockedTotalPages, setUnlockedTotalPages] = useState(1);
  const [unlockedLoading, setUnlockedLoading] = useState(false);

  const [revenuePoints, setRevenuePoints] = useState<MonthlyRevenuePoint[]>([]);
  const [revenueLoading, setRevenueLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    async function loadCustomers() {
      setCustomersLoading(true);
      try {
        const offset = customerPage * PAGE_SIZE;
        const { data } = await client.query<{ users: AdminUser[] }>({
          query: LIST_USERS,
          variables: { limit: PAGE_SIZE + 1, offset },
          fetchPolicy: "no-cache",
        });
        if (cancelled) return;
        const rows = data?.users ?? [];
        setCustomers(rows.slice(0, PAGE_SIZE));
        setCustomersHasMore(rows.length > PAGE_SIZE);
      } finally {
        if (!cancelled) setCustomersLoading(false);
      }
    }
    loadCustomers();
    return () => {
      cancelled = true;
    };
  }, [client, customerPage, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    async function loadPurchases() {
      setPurchasesLoading(true);
      try {
        const offset = (purchasePage - 1) * PAGE_SIZE;
        const { data } = await client.query<{
          creditPurchases: { items: Purchase[]; totalPages: number; page: number };
        }>({
          query: LIST_PURCHASES,
          variables: { limit: PAGE_SIZE, offset },
          fetchPolicy: "no-cache",
        });
        if (cancelled) return;
        const payload = data?.creditPurchases;
        setPurchases(payload?.items ?? []);
        setPurchaseTotalPages(payload?.totalPages ?? 1);
      } finally {
        if (!cancelled) setPurchasesLoading(false);
      }
    }
    loadPurchases();
    return () => {
      cancelled = true;
    };
  }, [client, isAdmin, purchasePage]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    async function loadUnlocked() {
      setUnlockedLoading(true);
      try {
        const offset = (unlockedPage - 1) * PAGE_SIZE;
        const { data } = await client.query<{
          unlockedPicksAdmin: { items: UnlockedPickRow[]; totalPages: number; page: number };
        }>({
          query: LIST_UNLOCKED,
          variables: { limit: PAGE_SIZE, offset },
          fetchPolicy: "no-cache",
        });
        if (cancelled) return;
        const payload = data?.unlockedPicksAdmin;
        setUnlockedRows(payload?.items ?? []);
        setUnlockedTotalPages(payload?.totalPages ?? 1);
      } finally {
        if (!cancelled) setUnlockedLoading(false);
      }
    }
    loadUnlocked();
    return () => {
      cancelled = true;
    };
  }, [client, isAdmin, unlockedPage]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    async function loadRevenue() {
      setRevenueLoading(true);
      try {
        const { data } = await client.query<{ monthlyRevenuePastYear: MonthlyRevenuePoint[] }>({
          query: MONTHLY_REVENUE,
          fetchPolicy: "no-cache",
        });
        if (cancelled) return;
        setRevenuePoints(data?.monthlyRevenuePastYear ?? []);
      } finally {
        if (!cancelled) setRevenueLoading(false);
      }
    }
    loadRevenue();
    return () => {
      cancelled = true;
    };
  }, [client, isAdmin]);

  const maxRevenue = useMemo(() => {
    return revenuePoints.reduce((acc, curr) => Math.max(acc, curr.totalCents), 0);
  }, [revenuePoints]);

  if (loading || !isAdmin) {
    return (
      <div className="container mx-auto gutters section-spacing">
        <div className="card p-6 text-center">
          {loading ? "Checking access..." : "You need admin access to view this page."}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto gutters section-spacing">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Monitor the latest platform activity</p>
        </div>
      </div>

      <div className="card p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Monthly Revenue (Past 12 Months)</h2>
          {!revenueLoading && (
            <span className="text-sm text-gray-500">
              Total: {formatCurrency(revenuePoints.reduce((sum, r) => sum + r.totalCents, 0))}
            </span>
          )}
        </div>
        {revenueLoading ? (
          <div className="h-48 flex items-center justify-center text-sm text-gray-500">Loading revenue…</div>
        ) : (
          <div className="h-56 flex items-end gap-3">
            {revenuePoints.map((point) => {
              const pct = maxRevenue ? Math.max(6, Math.round((point.totalCents / maxRevenue) * 100)) : 6;
              return (
                <div key={point.label} className="flex-1 flex flex-col items-center gap-2 h-full">
                  <div className="flex-1 flex items-end w-full h-full">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-emerald-500 to-lime-400 dark:from-emerald-400 dark:to-lime-300 shadow-md shadow-emerald-500/40 transition-all duration-300"
                      style={{ height: `${pct}%` }}
                      title={`${point.label}: ${formatCurrency(point.totalCents)}`}
                    />
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    <div>{point.label}</div>
                    <div className="font-semibold text-gray-700 dark:text-gray-200">{formatCurrencyCompact(point.totalCents)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid gap-6">
        <section className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-semibold">New Customers</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Newest signups, ordered by join date</p>
            </div>
            <span className="text-sm text-gray-400">10 per page</span>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {customersLoading ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-500">Loading customers…</td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-500">No customers found.</td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="border-t border-slate-200 dark:border-slate-800">
                      <td className="p-3">{customer.name || "Unnamed"}</td>
                      <td className="p-3">{customer.email}</td>
                      <td className="p-3">{formatDate(customer.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800">
            <button
              className="btn-secondary"
              disabled={customerPage === 0 || customersLoading}
              onClick={() => setCustomerPage((page) => Math.max(0, page - 1))}
            >
              Previous
            </button>
            <div className="text-sm text-gray-500">Page {customerPage + 1}</div>
            <button
              className="btn-secondary"
              disabled={!customersHasMore || customersLoading}
              onClick={() => setCustomerPage((page) => page + 1)}
            >
              Next
            </button>
          </div>
        </section>

        <section className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-semibold">New Purchases</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Latest orders placed by members</p>
            </div>
            <span className="text-sm text-gray-400">10 per page</span>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Package</th>
                  <th className="text-left p-3">Price</th>
                  <th className="text-left p-3">Purchased</th>
                </tr>
              </thead>
              <tbody>
                {purchasesLoading ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">Loading purchases…</td>
                  </tr>
                ) : purchases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">No purchases found.</td>
                  </tr>
                ) : (
                  purchases.map((purchase) => (
                    <tr key={purchase.id} className="border-t border-slate-200 dark:border-slate-800">
                      <td className="p-3">{purchase.user?.name || "Unknown"}</td>
                      <td className="p-3">{purchase.user?.email || "-"}</td>
                      <td className="p-3">{purchase.package?.title || "Custom"}</td>
                      <td className="p-3">{formatCurrency(purchase.priceInCents)}</td>
                      <td className="p-3">{formatDate(purchase.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800">
            <button
              className="btn-secondary"
              disabled={purchasePage === 1 || purchasesLoading}
              onClick={() => setPurchasePage((page) => Math.max(1, page - 1))}
            >
              Previous
            </button>
            <div className="text-sm text-gray-500">Page {purchasePage} of {purchaseTotalPages}</div>
            <button
              className="btn-secondary"
              disabled={purchasePage >= purchaseTotalPages || purchasesLoading}
              onClick={() => setPurchasePage((page) => page + 1)}
            >
              Next
            </button>
          </div>
        </section>

        <section className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-semibold">Picks Opened</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Latest unlock activity across the site</p>
            </div>
            <span className="text-sm text-gray-400">10 per page</span>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-left p-3">Member</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Pick</th>
                  <th className="text-left p-3">Match Time</th>
                  <th className="text-left p-3">Opened</th>
                </tr>
              </thead>
              <tbody>
                {unlockedLoading ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">Loading unlocks…</td>
                  </tr>
                ) : unlockedRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">No unlocked picks found.</td>
                  </tr>
                ) : (
                  unlockedRows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-200 dark:border-slate-800">
                      <td className="p-3">{row.user?.name || "Unknown"}</td>
                      <td className="p-3">{row.user?.email || "-"}</td>
                      <td className="p-3">{row.pick?.title || "-"}</td>
                      <td className="p-3">{row.pick?.matchTime ? formatDate(row.pick.matchTime) : "-"}</td>
                      <td className="p-3">{formatDate(row.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800">
            <button
              className="btn-secondary"
              disabled={unlockedPage === 1 || unlockedLoading}
              onClick={() => setUnlockedPage((page) => Math.max(1, page - 1))}
            >
              Previous
            </button>
            <div className="text-sm text-gray-500">Page {unlockedPage} of {unlockedTotalPages}</div>
            <button
              className="btn-secondary"
              disabled={unlockedPage >= unlockedTotalPages || unlockedLoading}
              onClick={() => setUnlockedPage((page) => page + 1)}
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
