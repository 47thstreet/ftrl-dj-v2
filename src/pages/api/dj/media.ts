import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/prisma';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = (locals as any).user;
  if (!user) return new Response('Unauthorized', { status: 401 });

  const body = await request.json();
  const { url, title, type } = body;

  if (!url || !type) {
    return new Response(JSON.stringify({ error: 'url and type required' }), { status: 400 });
  }

  const promoter = await prisma.promoter.findUnique({
    where: { userId: user.id },
    include: { site: true },
  });

  if (!promoter?.site) {
    return new Response(JSON.stringify({ error: 'No DJ profile found' }), { status: 404 });
  }

  const media = await prisma.media.create({
    data: {
      djId: promoter.site.id,
      type,
      url,
      title: title || null,
    },
  });

  return new Response(JSON.stringify({
    id: media.id,
    type: media.type,
    url: media.url,
    thumbnailUrl: media.thumbnailUrl,
    title: media.title,
    createdAt: media.createdAt.toISOString(),
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
