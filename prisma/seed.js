require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Strip sslmode from URL so the explicit ssl object below takes full control.
// Railway uses a self-signed cert, so rejectUnauthorized must be false.
const connectionString = (process.env.DATABASE_URL || '').replace(/[?&]sslmode=[^&]*/g, '').replace(/[?&]$/, '');
const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('R.Mdesignofficiel28340...', 12);

  const admin = await prisma.admin.upsert({
    where: { email: 'r.mdesignofficiel@gmail.com' },
    update: { password: hashedPassword, email: 'r.mdesignofficiel@gmail.com' },
    create: {
      email: 'r.mdesignofficiel@gmail.com',
      password: hashedPassword,
      name: 'Admin',
    },
  });

  console.log(`Seeded admin: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
