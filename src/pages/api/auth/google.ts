import type { APIRoute } from 'astro';
import { Google, generateState, generateCodeVerifier } from 'arctic';

const google = new Google(
  import.meta.env.GOOGLE_CLIENT_ID,
  import.meta.env.GOOGLE_CLIENT_SECRET,
  import.meta.env.GOOGLE_REDIRECT_URI
);

export const GET: APIRoute = async () => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'email', 'profile']);

  const headers = new Headers();
  headers.set('Location', url.toString());
  headers.set(
    'Set-Cookie',
    `google_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`
  );
  headers.append(
    'Set-Cookie',
    `google_code_verifier=${codeVerifier}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`
  );

  return new Response(null, { status: 302, headers });
};
