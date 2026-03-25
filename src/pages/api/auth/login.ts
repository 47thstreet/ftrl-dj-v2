import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/prisma';
import { verifyPassword, createSession, setSessionCookie } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    if (!user || !user.passwordHash) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sessionId = await createSession(user.id);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    setSessionCookie(headers, sessionId);

    return new Response(JSON.stringify({ ok: true }), { headers });
  } catch (err: any) {
    console.error('Login error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Login failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
