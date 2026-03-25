import { c as createComponent } from './astro-component_Bh5Q0xkq.mjs';
import 'piccolore';
import { h as renderHead, r as renderTemplate } from './ssr-function_BRcKK67D.mjs';
import 'clsx';
import { g as getDjBySlug } from './djs_DpzoyeEK.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const host = Astro2.request.headers.get("host") || "";
  const parts = host.split(".");
  let subdomain = "";
  const isCustomDomain = host.endsWith(".ftrl.ink");
  if (isCustomDomain && parts.length >= 3 && parts[0] !== "www") {
    subdomain = parts[0];
  }
  let dj = null;
  if (subdomain) {
    if (process.env.DATABASE_URL) {
      try {
        const { prisma } = await import('./prisma_QzARZxM8.mjs');
        const site = await prisma.promoterSite.findUnique({
          where: { slug: subdomain },
          include: { promoter: { include: { user: true } } }
        });
        if (site) {
          const socials = typeof site.socialLinks === "object" && site.socialLinks !== null ? site.socialLinks : {};
          dj = {
            slug: site.slug,
            name: site.promoter.displayName,
            tagline: site.tagline,
            bio: site.bio,
            primaryColor: site.primaryColor,
            accentColor: site.accentColor,
            heroImage: site.heroImage,
            logoImage: site.logoImage,
            socialLinks: socials,
            instagram: socials.instagram ? socials.instagram.replace("https://instagram.com/", "") : ""
          };
        }
      } catch {
      }
    }
    if (!dj) {
      const seed = getDjBySlug(subdomain);
      if (seed) dj = seed;
    }
  }
  if (dj) {
    return Astro2.redirect(`/dj/${dj.slug}`);
  } else if (subdomain) {
    return Astro2.redirect("/404");
  }
  return renderTemplate`<html lang="en" data-astro-cid-j7pv25f6> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>FTRL — Artist Link Pages</title><meta name="description" content="FTRL — Premium link-in-bio pages for DJs and artists. Your sound, your brand, one link."><meta property="og:title" content="FTRL"><meta property="og:description" content="Premium link-in-bio pages for DJs and artists."><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">${renderHead()}</head> <body data-astro-cid-j7pv25f6> <div class="bg" data-astro-cid-j7pv25f6> <div class="lava-blob lava-blob-1" data-astro-cid-j7pv25f6></div> <div class="lava-blob lava-blob-2" data-astro-cid-j7pv25f6></div> <div class="lava-blob lava-blob-3" data-astro-cid-j7pv25f6></div> </div> <div class="noise" data-astro-cid-j7pv25f6></div> <div class="page" data-astro-cid-j7pv25f6> <!-- ── Hero ── --> <div class="hero" data-astro-cid-j7pv25f6> <h1 class="logo" data-astro-cid-j7pv25f6>FTRL</h1> <p class="tagline" data-astro-cid-j7pv25f6> <strong data-astro-cid-j7pv25f6>Your sound. Your brand.</strong><br data-astro-cid-j7pv25f6>
One link.
</p> </div> <!-- ── Footer ── --> <div class="footer" data-astro-cid-j7pv25f6> <div class="footer-links" data-astro-cid-j7pv25f6> <a href="https://future-productions.vercel.app" target="_blank" rel="noopener" class="footer-link" data-astro-cid-j7pv25f6>Future Productions</a> <a href="mailto:booking@ftrl.ink" class="footer-link" data-astro-cid-j7pv25f6>Bookings</a> </div> <p class="footer-sub" data-astro-cid-j7pv25f6>Powered by Kartis</p> </div> </div> </body></html>`;
}, "/Users/tbp/Desktop/tb/ftrl-dj/src/pages/index.astro", void 0);

const $$file = "/Users/tbp/Desktop/tb/ftrl-dj/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
