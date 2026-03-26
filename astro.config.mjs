import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import sentry from '@sentry/astro';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [react(), sentry({
    dsn: import.meta.env.SENTRY_DSN,
  })],
});
