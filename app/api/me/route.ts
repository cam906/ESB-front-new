import { getCurrentUserFromRequest } from "@/app/lib/cognitoServer";

export async function GET(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return new Response(null, { status: 401 });
  return Response.json(user);
}


