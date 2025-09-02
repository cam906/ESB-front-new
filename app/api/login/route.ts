import { getSequelize } from "@/app/lib/db";
import { initUserModel, User } from "@/app/lib/models/User";
import { comparePassword, setAuthCookie, signJwt } from "@/app/lib/auth";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  if (!username || !password) return new Response("Missing credentials", { status: 400 });

  const sequelize = getSequelize();
  initUserModel(sequelize);
  try {
    const user = await User.findOne({ where: { email: username } });
    if (!user) return new Response("Invalid credentials", { status: 401 });
    const ok = await comparePassword(password, user.password);
    if (!ok) return new Response("Invalid credentials", { status: 401 });
    const role = (user.roles || "").split(",").map((r) => r.trim())[0] || null;
    const token = signJwt({ id: user.id, email: user.email, role });
    await setAuthCookie(token);
    return Response.json({ id: user.id, email: user.email, role });
  } catch (e) {
    return new Response("Server error", { status: 500 });
  }
}


