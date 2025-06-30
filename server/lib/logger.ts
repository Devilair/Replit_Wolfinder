import pino from 'pino';

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  ...(process.env.NODE_ENV !== 'production' && process.stdout.isTTY
    ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
    : {})
}); 