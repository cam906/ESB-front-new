import { getCurrentUser } from "@/app/lib/currentUser";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response(null, { status: 401 });
  return Response.json(user);
}


