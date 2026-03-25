import type { APIRoute } from 'astro';
import { Google } from 'arctic';
import { prisma } from '../../../../lib/prisma';
import { createSession, setSessionCookie } from '../../../../lib/auth';

const google = new Google(
  import.meta.env.GOOGLE_CLIENT_ID,
  import.meta.env.GOOGLE_CLIENT_SECRET,
  import.meta.env.GOOGLE_REDIRECT_URI
);

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  const cookies = request.headers.get('cookie') ?? '';
  const storedState = cookies.match(/google_oauth_state=([^;]+)/)?.[1];
  const codeVerifier = cookies.match(/google_code_verifier=([^;]+)/)?.[1];

  if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
    return new Response('Invalid OAuth state', { status: 400 });
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    const accessToken = tokens.accessToken();

    // Fetch user info from Google
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const googleUser = await res.json() as { id: string; email: string; name: string };

    // Upsert: find existing OAuth account or create new user
    const existingOAuth = await prisma.oAuthAccount.findUnique({
      where: { provider_providerUserId: { provider: 'google', providerUserId: googleUser.id } },
      include: { user: { include: { promoter: { include: { site: true } } } } },
    });

    let userId: string;

    if (existingOAuth) {
      userId = existingOAuth.userId;
    } else {
      // Check if a user with this email already exists
      const existingUser = await prisma.user.findUnique({ where: { email: googleUser.email } });

      if (existingUser) {
        // Link Google account to existing user
        await prisma.oAuthAccount.create({
          data: {
            provider: 'google',
            providerUserId: googleUser.id,
            userId: existingUser.id,
          },
        });
        userId = existingUser.id;
      } else {
        // Create new user + promoter + promoter site
        const slug = googleUser.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        const user = await prisma.user.create({
          data: {
            name: googleUser.name,
            email: googleUser.email,
            role: 'PROMOTER',
            oauthAccounts: {
              create: {
                provider: 'google',
                providerUserId: googleUser.id,
              },
            },
            promoter: {
              create: {
                displayName: googleUser.name,
                site: {
                  create: {
                    slug: `${slug}-${Date.now().toString(36)}`,
                    tagline: '',
                    bio: '',
                    isPublished: false,
                  },
                },
              },
            },
          },
        });
        userId = user.id;
      }
    }

    // Create session
    const sessionId = await createSession(userId);
    const headers = new Headers();
    setSessionCookie(headers, sessionId);

    // Clear OAuth cookies
    headers.append('Set-Cookie', 'google_oauth_state=; Path=/; HttpOnly; Max-Age=0');
    headers.append('Set-Cookie', 'google_code_verifier=; Path=/; HttpOnly; Max-Age=0');

    headers.set('Location', '/dashboard');
    return new Response(null, { status: 302, headers });
  } catch (error) {
    console.error('Google OAuth error:', error);
    return new Response('Authentication failed', { status: 500 });
  }
};
