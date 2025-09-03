import { notFound, redirect } from "next/navigation";
import { getCurrentUser, isCurrentUserAdmin } from "@/app/lib/currentUser";


export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/signin');
  if (!isCurrentUserAdmin(user)) notFound();
  return <>{children}</>;
}


