import { readAuthCookie, verifyJwt } from "@/app/lib/auth";
import { getSequelize } from "@/app/lib/db";
import { initUserModel, User } from "@/app/lib/models/User";

export async function GET() {
  const token = await readAuthCookie();
  if (!token) return new Response(null, { status: 401 });
  const payload = verifyJwt<{ id: number }>(token);
  if (!payload?.id) return new Response(null, { status: 401 });

  const sequelize = getSequelize();
  initUserModel(sequelize);
  const user = await User.findByPk(payload.id);
  if (!user) return new Response(null, { status: 401 });
  const role = (user.roles || "").split(",").map((r) => r.trim())[0] || null;
  return Response.json({ id: user.id, email: user.email, role });
}


