import { PromisePageProps } from "@premieroctet/next-admin"; import { getNextAdminProps } from "@premieroctet/next-admin/appRouter";
import { NextAdmin } from "@premieroctet/next-admin/adapters/next";
import PageLoader from "@premieroctet/next-admin/pageLoader";
import prisma from "../../../prisma";
import "../../../nextAdminCss.css";
import options from "../../../nextAdminOptions";
import { redirect } from "next/navigation";
import { getCurrentUser, isCurrentUserAdmin } from "@/app/lib/currentUser";

export default async function AdminPage(props: PromisePageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/signin');
  }
  if (!isCurrentUserAdmin(user)) {
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
