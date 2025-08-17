import { AsyncLocalStorage } from 'node:async_hooks'

import { ulid } from 'ulid'

import { logger } from './logger'

export interface CorrelationContext {
  correlationId: string
  userId?: string
  organizationId?: string
  requestId?: string
  [key: string]: unknown
}

class CorrelationContextManager {
  private storage = new AsyncLocalStorage<CorrelationContext>()

  run<T>(context: CorrelationContext, fn: () => T): T {
    return this.storage.run(context, fn)
  }

  runAsync<T>(context: CorrelationContext, fn: () => Promise<T>): Promise<T> {
    return this.storage.run(context, fn)
  }

  get(): CorrelationContext | undefined {
    return this.storage.getStore()
  }

  getCorrelationId(): string {
    const context = this.get()
    return context?.correlationId || 'no-correlation-id'
  }

  set(key: string, value: unknown): void {
    const context = this.get()
    if (context) {
      context[key] = value
    }
  }

  createContext(partial?: Partial<CorrelationContext>): CorrelationContext {
    return {
      correlationId: ulid(),
      ...partial,
    }
  }

  /**
   * Safely enters a new context, ensuring proper cleanup
   */
  enterContext<T>(context: CorrelationContext, fn: () => T): T {
    try {
      return this.storage.run(context, fn)
    } catch (error) {
      // Log context error but don't crash
      logger.error('Context error', error)
      throw error
    }
  }

  /**
   * Safely enters a new async context, ensuring proper cleanup
   */
  async enterContextAsync<T>(context: CorrelationContext, fn: () => Promise<T>): Promise<T> {
    try {
      return await this.storage.run(context, fn)
    } catch (error) {
      // Log context error but don't crash
      logger.error('Async context error', error)
      throw error
    }
  }

  /**
   * Exits current context (useful for cleanup)
   */
  exit(): void {
    this.storage.disable()
  }

  /**
   * Check if we're in a context
   */
  hasContext(): boolean {
    return this.get() !== undefined
  }

  /**
   * Create a child context from current context
   */
  createChildContext(overrides?: Partial<CorrelationContext>): CorrelationContext {
    const current = this.get()
    return {
      ...current,
      correlationId: current?.correlationId || ulid(),
      ...overrides,
    }
  }
}

// Export singleton instance
export const correlationContext = new CorrelationContextManager()
