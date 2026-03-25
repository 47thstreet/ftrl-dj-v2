import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/prisma';

async function getSite(locals: any) {
  const user = (locals as any).user;
  if (!user) return null;
  const promoter = await prisma.promoter.findUnique({
    where: { userId: user.id },
    include: { site: true },
  });
  return promoter?.site ?? null;
}

export const PUT: APIRoute = async ({ request, locals }) => {
  const site = await getSite(locals);
  if (!site) return new Response('Unauthorized', { status: 401 });

  const { date, status, note } = await request.json();
  if (!date || !status) {
    return new Response(JSON.stringify({ error: 'date and status required' }), { status: 400 });
  }

  // Upsert by djId + date
  const existing = await prisma.availability.findFirst({
    where: { djId: site.id, date },
  });

  let entry;
  if (existing) {
    entry = await prisma.availability.update({
      where: { id: existing.id },
      data: { status, note: note ?? null },
    });
  } else {
    entry = await prisma.availability.create({
      data: { djId: site.id, date, status, note: note ?? null },
    });
  }

  return new Response(JSON.stringify({
    id: entry.id,
    date: entry.date,
    status: entry.status,
    note: entry.note,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  const site = await getSite(locals);
  if (!site) return new Response('Unauthorized', { status: 401 });

  const { date } = await request.json();
  if (!date) {
    return new Response(JSON.stringify({ error: 'date required' }), { status: 400 });
  }

  await prisma.availability.deleteMany({
    where: { djId: site.id, date },
  });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
