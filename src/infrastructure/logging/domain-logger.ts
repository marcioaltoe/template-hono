import type winston from 'winston'

import { correlationContext } from './correlation-context'
import { LoggerFactory } from './logger-factory'
import { LogSanitizer } from './sanitizer'

export class DomainLogger {
  private logger: winston.Logger

  constructor(private context: string) {
    this.logger = LoggerFactory.getLogger(context)
  }

  private enrichMetadata(meta?: Record<string, unknown>): Record<string, unknown> {
    const context = correlationContext.get()
    const sanitized = meta ? LogSanitizer.sanitize(meta) : {}

    return {
      correlationId: context?.correlationId,
      userId: context?.userId,
      organizationId: context?.organizationId,
      context: this.context,
      timestamp: new Date().toISOString(),
      ...(sanitized as Record<string, unknown>),
    }
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug(message, this.enrichMetadata(meta))
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(message, this.enrichMetadata(meta))
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn(message, this.enrichMetadata(meta))
  }

  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    const errorData =
      error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
            ...(LogSanitizer.sanitize(Object.assign({}, error)) as Record<string, unknown>),
          }
        : error
          ? { error: LogSanitizer.sanitize(error) }
          : {}

    this.logger.error(message, {
      ...this.enrichMetadata(meta),
      error: errorData,
    })
  }

  startTimer(): () => number {
    const start = Date.now()

    return () => {
      const duration = Date.now() - start
      return duration
    }
  }

  logPerformance(operation: string, duration: number, meta?: Record<string, unknown>): void {
    const level = duration > 1000 ? 'warn' : 'info'

    this.logger.log(level, `Operation completed: ${operation}`, {
      ...this.enrichMetadata(meta),
      operation,
      duration,
      slow: duration > 1000,
    })
  }

  /**
   * Log method entry (useful for debugging)
   */
  methodEntry(methodName: string, args?: unknown): void {
    if (process.env.LOG_LEVEL === 'debug') {
      this.debug(`Entering ${methodName}`, {
        method: methodName,
        args: LogSanitizer.sanitize(args),
      })
    }
  }

  /**
   * Log method exit (useful for debugging)
   */
  methodExit(methodName: string, result?: unknown): void {
    if (process.env.LOG_LEVEL === 'debug') {
      this.debug(`Exiting ${methodName}`, {
        method: methodName,
        result: LogSanitizer.sanitize(result),
      })
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: Record<string, unknown>): DomainLogger {
    const childLogger = new DomainLogger(
      `${this.context}.${additionalContext.subContext || 'child'}`,
    )
    // Add additional context to correlation context if available
    const currentContext = correlationContext.get()
    if (currentContext) {
      for (const [key, value] of Object.entries(additionalContext)) {
        correlationContext.set(key, value)
      }
    }
    return childLogger
  }
}
