import { readAuthCookie, verifyJwt } from "@/app/lib/auth";
import prisma from "@/prisma";

export type CurrentUser = {
  id: number;
  email: string;
  role: string | null;
  credits: number;
  myReferralCode: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = await readAuthCookie();
  if (!token) return null;

  const payload = verifyJwt<{ id: number }>(token);
  if (!payload?.id) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) return null;

  let role = [];
  try {
    role = JSON.parse(user.roles || "[]");
  } catch {
    role = [];
  }

  return { id: user.id, email: user.email, role, credits: user.credits, myReferralCode: user.myReferralCode };
}


export function isCurrentUserAdmin(user: CurrentUser | null): boolean {
  if (!user) return false;
  if (!user.role) return false;
  return user.role.includes('ADMIN') || user.role.includes('SUPERADMIN');
}
