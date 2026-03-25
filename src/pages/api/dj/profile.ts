import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/prisma';

export const PUT: APIRoute = async ({ request, locals }) => {
  const user = (locals as any).user;
  if (!user) return new Response('Unauthorized', { status: 401 });

  const body = await request.json();
  const { displayName, tagline, bio, primaryColor, accentColor, heroImage, logoImage, socialLinks, genres, isPublished } = body;

  const promoter = await prisma.promoter.findUnique({
    where: { userId: user.id },
    include: { site: true },
  });

  if (!promoter?.site) {
    return new Response(JSON.stringify({ error: 'No DJ profile found' }), { status: 404 });
  }

  await prisma.promoter.update({
    where: { id: promoter.id },
    data: { displayName },
  });

  await prisma.promoterSite.update({
    where: { id: promoter.site.id },
    data: {
      tagline,
      bio,
      primaryColor,
      accentColor,
      heroImage: heroImage || null,
      logoImage: logoImage || null,
      socialLinks: socialLinks ?? {},
      genres: JSON.stringify(genres ?? []),
      isPublished,
    },
  });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
