import { logger } from './logger'

export class PerformanceLogger {
  private static timers = new Map<string, number>()

  static start(operation: string, correlationId?: string): void {
    const key = correlationId ? `${correlationId}-${operation}` : operation
    this.timers.set(key, Date.now())
  }

  static end(operation: string, correlationId?: string, metadata?: Record<string, unknown>): void {
    const key = correlationId ? `${correlationId}-${operation}` : operation
    const start = this.timers.get(key)

    if (!start) {
      logger.warn(`Performance timer not found for operation: ${operation}`, {
        operation,
        correlationId,
      })
      return
    }

    const duration = Date.now() - start
    this.timers.delete(key)

    logger.info('Performance metric', {
      operation,
      duration,
      correlationId,
      ...metadata,
    })
  }

  static async measure<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>,
  ): Promise<T> {
    const correlationId =
      typeof metadata?.correlationId === 'string' ? metadata.correlationId : undefined
    this.start(operation, correlationId)

    try {
      const result = await fn()
      this.end(operation, correlationId, { ...metadata, success: true })
      return result
    } catch (error) {
      this.end(operation, correlationId, {
        ...metadata,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  static startTimer(): () => number {
    const start = Date.now()

    return () => {
      const duration = Date.now() - start
      return duration
    }
  }
}
