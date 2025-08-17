import winston from 'winston'

import { logger } from './logger'

export interface LoggerOptions {
  level?: string
  metadata?: Record<string, unknown>
  transports?: winston.transport[]
}

export class LoggerFactory {
  private static loggers = new Map<string, winston.Logger>()

  static getLogger(context: string): winston.Logger {
    if (!this.loggers.has(context)) {
      const contextLogger = logger.child({
        context,
      })

      this.loggers.set(context, contextLogger)
    }

    const contextLogger = this.loggers.get(context)
    if (!contextLogger) {
      throw new Error(`Failed to create logger for context: ${context}`)
    }
    return contextLogger
  }

  static createLogger(options: LoggerOptions): winston.Logger {
    const { combine, timestamp, json, errors } = winston.format

    return winston.createLogger({
      level: options.level || 'info',
      format: combine(errors({ stack: true }), timestamp(), json()),
      defaultMeta: options.metadata,
      transports: options.transports || [new winston.transports.Console()],
    })
  }

  static clearCache(): void {
    this.loggers.clear()
  }
}
