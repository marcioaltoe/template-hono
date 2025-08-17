import type { Context, Next } from 'hono'

import { ulid } from 'ulid'

import { correlationContext } from './correlation-context'
import { logger } from './logger'

export async function loggingMiddleware(c: Context, next: Next) {
  const correlationId = c.req.header('x-correlation-id') || ulid()
  const requestId = ulid()

  const context = correlationContext.createContext({
    correlationId,
    requestId,
    method: c.req.method,
    path: c.req.path,
    ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
  })

  return correlationContext.runAsync(context, async () => {
    const start = Date.now()

    // Log request
    logger.info('Request received', {
      correlationId,
      requestId,
      method: c.req.method,
      path: c.req.path,
      query: c.req.query(),
      headers: {
        'user-agent': c.req.header('user-agent'),
        'content-type': c.req.header('content-type'),
      },
    })

    try {
      // Set correlation ID in response header
      c.header('x-correlation-id', correlationId)
      c.header('x-request-id', requestId)

      await next()

      const duration = Date.now() - start

      // Log response
      logger.info('Request completed', {
        correlationId,
        requestId,
        status: c.res.status,
        duration,
        responseSize: c.res.headers.get('content-length'),
      })
    } catch (error) {
      const duration = Date.now() - start

      logger.error('Request failed', {
        correlationId,
        requestId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        duration,
      })

      throw error
    }
  })
}
