import { PrismaClient } from '@prisma/client';
const p = new PrismaClient({
  datasources: {
    db: { url: 'postgresql://neondb_owner:npg_sOfbRuc1Jp7I@ep-misty-meadow-adwgjs1e.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require' }
  }
});
try {
  const count = await p.user.count();
  console.log('users:', count);
} catch(e) {
  console.error('ERROR:', e.message);
} finally {
  await p.$disconnect();
}
