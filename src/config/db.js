const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const globalForPrisma = globalThis;

if (!globalForPrisma.prisma) {
  const adapter = new PrismaPg(process.env.DATABASE_URL);
  globalForPrisma.prisma = new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma;

module.exports = prisma;
