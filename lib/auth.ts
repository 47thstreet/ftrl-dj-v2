import { prisma } from '../src/lib/prisma';
import type { User } from '@prisma/client';

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Password hashing using Web Crypto PBKDF2 (works everywhere)
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
  const hashHex = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, keyHex] = stored.split(':');
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(h => parseInt(h, 16)));
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
  const hashHex = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex === keyHex;
}

export async function createSession(userId: string): Promise<string> {
  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
    },
  });
  return session.id;
}

export async function validateSession(sessionId: string): Promise<User | null> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: sessionId } });
    return null;
  }
  return session.user;
}

export async function destroySession(sessionId: string): Promise<void> {
  await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
}

export function setSessionCookie(headers: Headers, sessionId: string): void {
  headers.set(
    'Set-Cookie',
    `session_id=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
  );
}

export function clearSessionCookie(headers: Headers): void {
  headers.set(
    'Set-Cookie',
    `session_id=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
}

export function getSessionIdFromCookie(request: Request): string | null {
  const cookie = request.headers.get('cookie') ?? '';
  const match = cookie.match(/session_id=([^;]+)/);
  return match ? match[1] : null;
}
