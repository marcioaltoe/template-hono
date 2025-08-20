import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import { RedisService } from '@/infrastructure/cache'
import {
  config,
  createRedisConnection,
  DatabaseConfig,
  getRedisConfig,
} from '@/infrastructure/config'

// Initialize configuration first
const configInit = config.initialize()
if (configInit.isFailure) {
  console.error('❌ Configuration error:', configInit.error)
  process.exit(1)
}

// Initialize app
const app = new Hono()

// Global middleware
app.use('*', logger())
app.use(
  '*',
  cors({
    origin: config.get('CORS_ORIGINS').split(','),
    credentials: true,
  }),
)

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.getEnvironment(),
  })
})

// Initialize services
async function bootstrap() {
  try {
    // Database connection
    const _db = DatabaseConfig.getDrizzle()

    // Test database connection
    const dbTest = await DatabaseConfig.testConnection()
    if (dbTest.isFailure) {
      throw new Error(dbTest.error)
    }

    // Redis connection
    const redisConfig = getRedisConfig()
    const redis = createRedisConnection(redisConfig)
    const _cacheService = new RedisService(redis)

    // Start server
    const server = Bun.serve({
      port: config.get('PORT'),
      hostname: config.get('HOST'),
      fetch: app.fetch,
    })

    console.log(`🚀 Server running at http://${config.get('HOST')}:${config.get('PORT')}`)
    console.log(`📊 Environment: ${config.getEnvironment()}`)

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully...')
      server.stop()
      redis.disconnect()
      await DatabaseConfig.close()
      process.exit(0)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Start the application
bootstrap()
