import winston from 'winston'

const { combine, timestamp, json, errors, printf, colorize } = winston.format

// Custom format for development
const devFormat = printf(({ level, message, timestamp, correlationId, ...meta }) => {
  const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
  return `${timestamp} [${correlationId || 'no-correlation'}] ${level}: ${message} ${metaStr}`
})

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    json(),
  ),
  defaultMeta: {
    service: 'template-hono',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === 'production'
          ? json()
          : combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), devFormat),
    }),
  ],
})

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  )

  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  )
}

// Export a child logger factory function
export function createChildLogger(context: string): winston.Logger {
  return logger.child({ context })
}
