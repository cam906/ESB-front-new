import jwt, { SignOptions, Secret } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "sid";

export function signJwt(payload: Record<string, unknown>) {
  const secret: Secret = JWT_SECRET;
  const expiresIn = JWT_EXPIRES_IN as unknown as SignOptions["expiresIn"];
  const opts: SignOptions = { expiresIn };
  return jwt.sign(payload, secret, opts);
}

export function verifyJwt<T>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    return null;
  }
}

export async function hashPassword(plain: string): Promise<string> {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
  return bcrypt.hash(plain, saltRounds);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function setAuthCookie(token: string) {
  const c = await cookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookie() {
  const c = await cookies();
  c.set(COOKIE_NAME, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export async function readAuthCookie(): Promise<string | null> {
  const c = await cookies();
  const v = c.get(COOKIE_NAME)?.value;
  return v || null;
}


