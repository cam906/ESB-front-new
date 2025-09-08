import { jwtVerify, createRemoteJWKSet, JWTPayload } from 'jose';
import prisma from '@/prisma';

type VerifiedClaims = JWTPayload & {
  sub?: string;
  email?: string;
  'cognito:groups'?: string[];
  token_use?: 'id' | 'access' | string;
};

function getUserPoolId(): string | null {
  return process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? null;
}

function getJwksUrl(): string | null {
  const userPoolId = getUserPoolId();
  if (!userPoolId) return null;
  const region = userPoolId.split('_')[0];
  return `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks(): ReturnType<typeof createRemoteJWKSet> {
  if (!jwks) {
    const url = getJwksUrl();
    if (!url) throw new Error('Cognito JWKS URL is not configured');
    jwks = createRemoteJWKSet(new URL(url));
  }
  return jwks;
}

export async function verifyBearerToken(authorizationHeader?: string): Promise<VerifiedClaims | null> {
  try {
    if (!authorizationHeader) return null;
    const [scheme, token] = authorizationHeader.split(' ');
    if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) return null;

    const { payload } = await jwtVerify(token, getJwks(), {
      // We intentionally do not hard-enforce audience/issuer to keep flexibility during migration
      // If needed, set issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`
    });
    return payload as VerifiedClaims;
  } catch {
    return null;
  }
}

export type DbCurrentUser = {
  id: number;
  email: string;
  role: string | null;
  credits: number;
  myReferralCode: string | null;
};

export async function getDbUserFromClaims(claims: VerifiedClaims | null): Promise<DbCurrentUser | null> {
  if (!claims?.sub && !claims?.email) return null;
  const sub = claims.sub ?? null;
  const email = claims.email ?? null;

  let user = await (async () => {
    if (sub) return prisma.user.findUnique({ where: { cognitoUserId: sub } });
    if (email) return prisma.user.findUnique({ where: { email } });
    return null;
  })();

  // If we found by email but cognitoUserId is missing, link it
  if (!user && email) {
    user = await prisma.user.findUnique({ where: { email } });
  }

  if (user && sub && user.cognitoUserId !== sub) {
    try {
      user = await prisma.user.update({ where: { id: user.id }, data: { cognitoUserId: sub, updatedAt: new Date() } });
    } catch {
      // ignore linking errors
    }
  }

  if (!user && email) {
    // Optionally create a user record if none exists yet
    try {
      user = await prisma.user.create({
        data: {
          email,
          name: null,
          credits: 0,
          cognitoUserId: sub ?? null,
          roles: null,
          myReferralCode: null,
          otherReferralCode: null,
          password: '!', // placeholder, not used with Cognito
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch {
      // ignore create errors
    }
  }

  if (!user) return null;

  // Normalize role; prefer DB roles, but allow Cognito groups to imply admin
  let role = user.roles ?? null;
  const groups = Array.isArray(claims?.['cognito:groups']) ? claims?.['cognito:groups'] : [];
  if (!role && groups?.length) {
    role = JSON.stringify(groups);
  }

  return {
    id: user.id,
    email: user.email,
    role,
    credits: user.credits,
    myReferralCode: user.myReferralCode,
  };
}

export async function getCurrentUserFromRequest(request: Request): Promise<DbCurrentUser | null> {
  // Prefer Authorization header
  const authz = request.headers.get('authorization') || request.headers.get('Authorization') || undefined;
  let claims = await verifyBearerToken(authz);
  if (claims) return getDbUserFromClaims(claims);

  // Fallback: try cookie set by client with id token
  const cookieHeader = request.headers.get('cookie') || request.headers.get('Cookie') || '';
  const token = parseCookie(cookieHeader)['amplify_id_token'];
  if (token) {
    try {
      const { payload } = await jwtVerify(token, getJwks());
      claims = payload as VerifiedClaims;
      return getDbUserFromClaims(claims);
    } catch {
      return null;
    }
  }
  return null;
}

function parseCookie(cookieHeader: string): Record<string, string> {
  const out: Record<string, string> = {};
  cookieHeader.split(';').forEach(part => {
    const idx = part.indexOf('=');
    if (idx > -1) {
      const name = part.slice(0, idx).trim();
      const val = decodeURIComponent(part.slice(idx + 1).trim());
      if (name) out[name] = val;
    }
  });
  return out;
}

export function isAdminUser(user: DbCurrentUser | null): boolean {
  if (!user) return false;
  if (!user.role) return false;
  try {
    const arr = Array.isArray(user.role) ? user.role : JSON.parse(user.role);
    return Array.isArray(arr) && (arr.includes('ADMIN') || arr.includes('SUPERADMIN') || arr.includes('admin') || arr.includes('superadmin'));
  } catch {
    return false;
  }
}


