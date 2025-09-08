import { NextRequest } from 'next/server';

// Sets an HTTP-only cookie with the Amplify ID token so server routes can read it
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token || typeof token !== 'string') {
      return new Response('Bad Request', { status: 400 });
    }

    const cookie = `amplify_id_token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax`;

    return new Response(null, {
      status: 204,
      headers: {
        'Set-Cookie': cookie,
      },
    });
  } catch {
    return new Response('Bad Request', { status: 400 });
  }
}


