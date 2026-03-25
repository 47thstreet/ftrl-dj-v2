import type { APIRoute } from 'astro';
import { generateState } from 'arctic';

// Instagram Basic Display API OAuth
const INSTAGRAM_CLIENT_ID = import.meta.env.INSTAGRAM_CLIENT_ID;
const INSTAGRAM_REDIRECT_URI = import.meta.env.INSTAGRAM_REDIRECT_URI;

export const GET: APIRoute = async () => {
  const state = generateState();
  const url = new URL('https://api.instagram.com/oauth/authorize');
  url.searchParams.set('client_id', INSTAGRAM_CLIENT_ID);
  url.searchParams.set('redirect_uri', INSTAGRAM_REDIRECT_URI);
  url.searchParams.set('scope', 'user_profile');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('state', state);

  const headers = new Headers();
  headers.set('Location', url.toString());
  headers.set(
    'Set-Cookie',
    `instagram_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`
  );

  return new Response(null, { status: 302, headers });
};
