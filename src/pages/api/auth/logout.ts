import type { APIRoute } from 'astro';
import { destroySession, clearSessionCookie, getSessionIdFromCookie } from '../../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  const sessionId = getSessionIdFromCookie(request);
  if (sessionId) {
    await destroySession(sessionId);
  }

  const headers = new Headers();
  clearSessionCookie(headers);
  headers.set('Location', '/');
  return new Response(null, { status: 302, headers });
};
