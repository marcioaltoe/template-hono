import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { config } from './infrastructure/config/config'
import { ConnectionValidator } from './infrastructure/config/validator'
import { logger, loggingMiddleware } from './infrastructure/logging'
import { docsRoutes } from './presentation/api/routes/docs.routes'

// Initialize configuration
const initResult = config.initialize()
if (initResult.isFailure) {
  logger.error('Failed to initialize configuration', new Error(initResult.error || 'Unknown error'))
  process.exit(1)
}

// Validate connections in production
if (config.isProduction()) {
  ConnectionValidator.validateProduction().then((result) => {
    if (result.isFailure) {
      logger.error('Production validation failed', new Error(result.error || 'Unknown error'))
      process.exit(1)
    }
  })
}

const app = new Hono()

// Middleware
app.use('*', cors())
app.use('*', loggingMiddleware)

// Health check
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'Hono',
    version: '0.1.0',
    documentation: `${c.req.url.replace(c.req.path, '')}/api/docs`,
    endpoints: {
      health: '/',
      docs: '/api/docs',
    },
  })
})

// API routes
// app.route('/api/organizations', organizationRoutes)

// API documentation
app.route('/api/docs', docsRoutes)

// Error handling
app.onError((err, c) => {
  logger.error('Unhandled error', err instanceof Error ? err : new Error(String(err)))
  return c.json({ error: 'Internal Server Error' }, 500)
})

// Not found
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
})

const port = process.env.PORT || 3000
logger.info(`Server is running on port ${port}`, { port })

export default app
