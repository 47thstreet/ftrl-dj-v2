import { defineMiddleware } from 'astro:middleware';

function getSessionIdFromCookie(request: Request): string | null {
  const cookie = request.headers.get('cookie') ?? '';
  const match = cookie.match(/session_id=([^;]+)/);
  return match ? match[1] : null;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Get user from session cookie for all requests
  const sessionId = getSessionIdFromCookie(context.request);
  if (sessionId) {
    try {
      const { validateSession } = await import('../lib/auth');
      const user = await validateSession(sessionId);
      if (user) {
        (context.locals as any).user = user;
        (context.locals as any).sessionId = sessionId;
      }
    } catch {
      // DB unavailable — proceed without auth
    }
  }

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/dj/')) {
    if (!(context.locals as any).user) {
      return context.redirect('/auth/login');
    }
  }

  return next();
});
