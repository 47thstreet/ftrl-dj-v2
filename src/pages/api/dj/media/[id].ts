import type { APIRoute } from 'astro';
import { prisma } from '../../../../lib/prisma';

export const DELETE: APIRoute = async ({ params, locals }) => {
  const user = (locals as any).user;
  if (!user) return new Response('Unauthorized', { status: 401 });

  const promoter = await prisma.promoter.findUnique({
    where: { userId: user.id },
    include: { site: true },
  });

  if (!promoter?.site) {
    return new Response('Not found', { status: 404 });
  }

  // Verify the media belongs to this DJ
  const media = await prisma.media.findUnique({ where: { id: params.id } });
  if (!media || media.djId !== promoter.site.id) {
    return new Response('Not found', { status: 404 });
  }

  await prisma.media.delete({ where: { id: params.id } });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
