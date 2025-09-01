import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

async function getUser() {
  const h = await headers();
  const protocol = h.get('x-forwarded-proto') || 'http';
  const host = h.get('x-forwarded-host') || h.get('host');
  const origin = `${protocol}://${host}`;
  const res = await fetch(`${origin}/api/me`, {
    cache: 'no-store',
    credentials: 'include',
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect('/signin');
  if (!user.role || (user.role !== 'admin' && user.role !== 'superadmin')) {
    notFound();
  }
  return <>{children}</>;
}


