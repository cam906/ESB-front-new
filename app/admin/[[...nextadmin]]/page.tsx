import { PromisePageProps } from "@premieroctet/next-admin"; import { getNextAdminProps } from "@premieroctet/next-admin/appRouter";
import { NextAdmin } from "@premieroctet/next-admin/adapters/next";
import PageLoader from "@premieroctet/next-admin/pageLoader";
import prisma from "../../../prisma";
import "../../../nextAdminCss.css";
import options from "../../../nextAdminOptions";
import { redirect } from "next/navigation";
import SignInRedirect from "@/app/components/SignInRedirect";
import { cookies } from "next/headers";
import { getCurrentUserFromRequest, isAdminUser } from "@/app/lib/cognitoServer";

export default async function AdminPage(props: PromisePageProps) {
  // Reconstruct a Request-like object to reuse the JWT parsing logic
  const c = await cookies();
  const cookieHeader = c.getAll().map((x) => `${x.name}=${x.value}`).join('; ');
  const req = new Request('http://local/admin', { headers: { cookie: cookieHeader } });
  const user = await getCurrentUserFromRequest(req);
  if (!user) return <SignInRedirect />;
  if (!isAdminUser(user)) {
    redirect('/not-allowed');
  }
  const params = await props.params;
  const searchParams = await props.searchParams;

  const nextAdminProps = await getNextAdminProps({
    params: params.nextadmin,
    searchParams,
    basePath: "/admin",
    apiBasePath: "/api/admin",
    prisma,
    options
  });

  return (
    <NextAdmin pageLoader={<PageLoader />} {...nextAdminProps} />
  );
}
