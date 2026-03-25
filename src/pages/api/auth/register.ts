import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/prisma';
import { hashPassword, createSession, setSessionCookie } from '../../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: 'Name, email, and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return new Response(JSON.stringify({ error: 'An account with this email already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const passwordHash = await hashPassword(password);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'PROMOTER',
        promoter: {
          create: {
            displayName: name.trim(),
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

    const sessionId = await createSession(user.id);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    setSessionCookie(headers, sessionId);

    return new Response(JSON.stringify({ ok: true }), { headers });
  } catch (err: any) {
    console.error('Register error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Registration failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
