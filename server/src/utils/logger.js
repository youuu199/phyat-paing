import pino from 'pino';

/**
 * Structured logger using pino.
 *
 * Features:
 *  - JSON output in production for log aggregation
 *  - Pretty-printed output in development for readability
 *  - Log levels: fatal, error, warn, info, debug, trace
 *  - Automatic request ID injection via pino-http
 */

const isProduction = process.env.NODE_ENV === 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),

  // In development, use pretty printing for readability
  ...(isProduction ? {} : {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  }),

  // Base fields added to every log entry
  base: {
    service: 'bill-organizer',
  },

  // Redact sensitive fields
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
    censor: '[REDACTED]',
  },
});

export default logger;
