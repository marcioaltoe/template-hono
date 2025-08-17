import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { swaggerUI } from '@hono/swagger-ui'
import { Hono } from 'hono'

import { logger } from '@/infrastructure/logging'

const docsRoutes = new Hono()

// Serve OpenAPI spec as JSON
docsRoutes.get('/openapi.json', (c) => {
  try {
    const specPath = join(process.cwd(), 'src', 'presentation', 'api', 'specs', 'openapi.json')
    const specContent = readFileSync(specPath, 'utf8')
    const jsonSpec = JSON.parse(specContent)

    return c.json(jsonSpec)
  } catch (error) {
    logger.error('Failed to load OpenAPI spec', error)
    return c.json({ error: 'OpenAPI specification not found' }, 404)
  }
})

// Serve Swagger UI
docsRoutes.get(
  '/',
  swaggerUI({
    url: '/api/docs/openapi.json',
  }),
)

export { docsRoutes }
