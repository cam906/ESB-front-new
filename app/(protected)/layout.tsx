import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/currentUser";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/signin');
  return <>{children}</>;
}


