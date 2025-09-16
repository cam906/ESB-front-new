import prisma from "../../../../prisma";
import { createHandler } from "@premieroctet/next-admin/appHandler";
import options from "../../../../nextAdminOptions";
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUserFromRequest, isAdminUser } from "@/app/lib/cognitoServer";

const { run } = createHandler({
  apiBasePath: "/api/admin",
  prisma,
  options
});

type NextAdminContext = { params: { nextadmin?: string[] } };
type RouteContext = { params: Promise<{ nextadmin?: string[] }> };
const runHandler = run as (request: Request, context: NextAdminContext) => Promise<Response>;

export async function GET(request: NextRequest, context: RouteContext) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  if (!isAdminUser(user)) return new NextResponse("Forbidden", { status: 403 });
  const unwrappedContext: NextAdminContext = { params: await context.params };
  return runHandler(request, unwrappedContext);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  if (!isAdminUser(user)) return new NextResponse("Forbidden", { status: 403 });
  const unwrappedContext: NextAdminContext = { params: await context.params };
  return runHandler(request, unwrappedContext);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  if (!isAdminUser(user)) return new NextResponse("Forbidden", { status: 403 });
  const unwrappedContext: NextAdminContext = { params: await context.params };
  return runHandler(request, unwrappedContext);
}
