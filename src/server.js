const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const prisma = require('./config/db');

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} [${env.NODE_ENV}]`);
});

// ─── Graceful shutdown ───────────────────────────────────
async function shutdown(signal) {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Database disconnected');
    process.exit(0);
  });

  // Force exit after 10s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  logger.error(err, 'Unhandled rejection');
  shutdown('unhandledRejection');
});
