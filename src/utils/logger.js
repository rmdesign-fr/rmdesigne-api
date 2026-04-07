const pino = require('pino');
const env = require('../config/env');

const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty' }
      : undefined,
});

module.exports = logger;
