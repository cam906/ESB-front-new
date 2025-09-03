import prisma from "../../../../prisma";
import { createHandler } from "@premieroctet/next-admin/appHandler";
import options from "../../../../nextAdminOptions";
import { NextResponse } from "next/server";
import { getCurrentUser, isCurrentUserAdmin } from "@/app/lib/currentUser";

const { run } = createHandler({
  apiBasePath: "/api/admin",
  prisma,
  options
});

type NextAdminContext = { params: { nextadmin?: string[] } };
const runHandler = run as (request: Request, context: NextAdminContext) => Promise<Response>;

export async function GET(request: Request, context: NextAdminContext) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  if (!isCurrentUserAdmin(user)) return new NextResponse("Forbidden", { status: 403 });
  return runHandler(request, context);
}

export async function POST(request: Request, context: NextAdminContext) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  if (!isCurrentUserAdmin(user)) return new NextResponse("Forbidden", { status: 403 });
  return runHandler(request, context);
}

export async function DELETE(request: Request, context: NextAdminContext) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  if (!isCurrentUserAdmin(user)) return new NextResponse("Forbidden", { status: 403 });
  return runHandler(request, context);
}
