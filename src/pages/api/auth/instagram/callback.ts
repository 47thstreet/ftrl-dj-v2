import type { APIRoute } from 'astro';
import { prisma } from '../../../../lib/prisma';
import { createSession, setSessionCookie } from '../../../../lib/auth';

const INSTAGRAM_CLIENT_ID = import.meta.env.INSTAGRAM_CLIENT_ID;
const INSTAGRAM_CLIENT_SECRET = import.meta.env.INSTAGRAM_CLIENT_SECRET;
const INSTAGRAM_REDIRECT_URI = import.meta.env.INSTAGRAM_REDIRECT_URI;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  const cookies = request.headers.get('cookie') ?? '';
  const storedState = cookies.match(/instagram_oauth_state=([^;]+)/)?.[1];

  if (!code || !state || !storedState || state !== storedState) {
    return new Response('Invalid OAuth state', { status: 400 });
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: INSTAGRAM_CLIENT_ID,
        client_secret: INSTAGRAM_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: INSTAGRAM_REDIRECT_URI,
        code,
      }),
    });

    const tokenData = await tokenRes.json() as { access_token: string; user_id: number };

    // Get user profile
    const profileRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${tokenData.access_token}`
    );
    const igUser = await profileRes.json() as { id: string; username: string };

    // Upsert
    const existingOAuth = await prisma.oAuthAccount.findUnique({
      where: { provider_providerUserId: { provider: 'instagram', providerUserId: igUser.id } },
    });

    let userId: string;

    if (existingOAuth) {
      userId = existingOAuth.userId;
    } else {
      const slug = igUser.username.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const user = await prisma.user.create({
        data: {
          name: igUser.username,
          email: `${igUser.username}@instagram.local`,
          role: 'PROMOTER',
          oauthAccounts: {
            create: {
              provider: 'instagram',
              providerUserId: igUser.id,
            },
          },
          promoter: {
            create: {
              displayName: igUser.username,
              site: {
                create: {
                  slug: `${slug}-${Date.now().toString(36)}`,
                  tagline: '',
                  bio: '',
                  socialLinks: { instagram: `https://instagram.com/${igUser.username}` },
                  isPublished: false,
                },
              },
            },
          },
        },
      });
      userId = user.id;
    }

    const sessionId = await createSession(userId);
    const headers = new Headers();
    setSessionCookie(headers, sessionId);
    headers.append('Set-Cookie', 'instagram_oauth_state=; Path=/; HttpOnly; Max-Age=0');
    headers.set('Location', '/dashboard');
    return new Response(null, { status: 302, headers });
  } catch (error) {
    console.error('Instagram OAuth error:', error);
    return new Response('Authentication failed', { status: 500 });
  }
};
