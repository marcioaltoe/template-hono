import { Redis as RedisClient } from 'ioredis'

import { logger } from '../logging'
import { config } from './config'
import { DatabaseConfig } from './database.config'

/**
 * Connection validation result
 */
interface ValidationResult {
  service: string
  success: boolean
  message: string
  duration?: number
}

/**
 * Connection validator for all external services
 * Tests connectivity at startup to fail fast
 */
export class ConnectionValidator {
  /**
   * Validate all connections
   */
  static async validateAll(): Promise<{
    isSuccess: boolean
    isFailure: boolean
    error?: string
    getValue?: () => ValidationResult[]
  }> {
    const results: ValidationResult[] = []

    // Test database connection
    const dbResult = await ConnectionValidator.validateDatabase()
    results.push(dbResult)

    // Test Redis connection
    const redisResult = await ConnectionValidator.validateRedis()
    results.push(redisResult)

    // Test S3/Spaces connection
    const s3Result = await ConnectionValidator.validateS3()
    results.push(s3Result)

    // Check if any validation failed
    const hasFailures = results.some((r) => !r.success)

    if (hasFailures) {
      const failures = results
        .filter((r) => !r.success)
        .map((r) => `${r.service}: ${r.message}`)
        .join(', ')

      logger.error('Connection validation failed', new Error(failures))
      return {
        isSuccess: false,
        isFailure: true,
        error: `Connection validation failed: ${failures}`,
      }
    }

    logger.info('All connections validated successfully', { results })
    return { isSuccess: true, isFailure: false, getValue: () => results }
  }

  /**
   * Validate database connection
   */
  static async validateDatabase(): Promise<ValidationResult> {
    const start = Date.now()

    try {
      const result = await DatabaseConfig.testConnection()
      const duration = Date.now() - start

      if (result.isSuccess) {
        return {
          service: 'PostgreSQL',
          success: true,
          message: 'Connected successfully',
          duration,
        }
      }

      return {
        service: 'PostgreSQL',
        success: false,
        message: result.error || 'Connection failed',
        duration,
      }
    } catch (error) {
      const duration = Date.now() - start
      const message = error instanceof Error ? error.message : 'Unknown error'

      return {
        service: 'PostgreSQL',
        success: false,
        message,
        duration,
      }
    }
  }

  /**
   * Validate Redis connection
   */
  static async validateRedis(): Promise<ValidationResult> {
    const start = Date.now()
    const redisConfig = config.getRedisOptions()

    const redisOptions = {
      host: redisConfig.host,
      port:
        typeof redisConfig.port === 'string' ? parseInt(redisConfig.port, 10) : redisConfig.port,
      password: redisConfig.password || undefined,
      db: typeof redisConfig.db === 'string' ? parseInt(redisConfig.db, 10) : redisConfig.db,
      lazyConnect: true,
      retryStrategy: () => null, // Don't retry during validation
      connectTimeout: 5000,
      maxRetriesPerRequest: 1,
    }

    const redis = new RedisClient(redisOptions)

    try {
      await redis.connect()
      await redis.ping()
      const duration = Date.now() - start

      await redis.quit()

      return {
        service: 'Redis',
        success: true,
        message: 'Connected successfully',
        duration,
      }
    } catch (error) {
      const duration = Date.now() - start
      const message = error instanceof Error ? error.message : 'Unknown error'

      await redis.quit().catch(() => {}) // Ensure cleanup

      return {
        service: 'Redis',
        success: false,
        message,
        duration,
      }
    }
  }

  /**
   * Validate S3/Spaces connection
   */
  static async validateS3(): Promise<ValidationResult> {
    const start = Date.now()
    const duration = Date.now() - start

    // Skip S3 validation for now as @aws-sdk/client-s3 is not installed
    // This would need to be installed for production use
    if (config.isDevelopment() || config.isTest()) {
      return {
        service: 'S3/Spaces',
        success: true,
        message: 'Skipped in development/test',
        duration,
      }
    }

    return {
      service: 'S3/Spaces',
      success: false,
      message: 'S3 client not configured',
      duration,
    }
  }

  /**
   * Validate connections required for production
   */
  static async validateProduction(): Promise<{
    isSuccess: boolean
    isFailure: boolean
    error?: string
  }> {
    if (!config.isProduction()) {
      return { isSuccess: true, isFailure: false }
    }

    const results = await ConnectionValidator.validateAll()

    if (results.isFailure) {
      return {
        isSuccess: false,
        isFailure: true,
        error: results.error || 'Production validation failed',
      }
    }

    // In production, all services must be available
    const validationResults = results.getValue ? results.getValue() : []
    const allSuccess = validationResults.every((r: ValidationResult) => r.success)

    if (!allSuccess) {
      const failures = validationResults
        .filter((r: ValidationResult) => !r.success)
        .map((r: ValidationResult) => r.service)
        .join(', ')

      return {
        isSuccess: false,
        isFailure: true,
        error: `Production requires all services to be available. Failed: ${failures}`,
      }
    }

    return { isSuccess: true, isFailure: false }
  }

  /**
   * Get connection health status
   */
  static async getHealthStatus(): Promise<{
    healthy: boolean
    services: ValidationResult[]
  }> {
    const results = await ConnectionValidator.validateAll()

    if (results.isFailure) {
      return {
        healthy: false,
        services: [],
      }
    }

    const services = results.getValue ? results.getValue() : []
    const healthy = services.every((s: ValidationResult) => s.success)

    return {
      healthy,
      services,
    }
  }
}
