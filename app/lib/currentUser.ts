import { readAuthCookie, verifyJwt } from "@/app/lib/auth";
import prisma from "@/prisma";

export type CurrentUser = {
  id: number;
  email: string;
  role: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = await readAuthCookie();
  if (!token) return null;

  const payload = verifyJwt<{ id: number }>(token);
  if (!payload?.id) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) return null;

  const role = (user.roles || "")
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean)[0] || null;

  return { id: user.id, email: user.email, role };
}

export function getCurrentUserRoles(user: CurrentUser): string[] {
  if (!user.role) return [];
  try {
    return JSON.parse(user.role);
  } catch {
    return [];
  }
}

export function isCurrentUserAdmin(user: CurrentUser | null): boolean {
  if (!user) return false;
  return getCurrentUserRoles(user).includes('ADMIN') || getCurrentUserRoles(user).includes('SUPERADMIN');
}
