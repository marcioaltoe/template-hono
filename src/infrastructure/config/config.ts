import { logger } from '@/infrastructure/logging'

import { type Env, EnvSchema, ProductionEnvSchema } from './env.schema'

/**
 * Configuration singleton for managing environment variables
 * Validates and provides type-safe access to configuration
 * Uses Bun's native environment loading (no dotenv needed)
 */
export class Config {
  private static instance: Config | null = null
  private env: Env | null = null
  private validated = false

  private constructor() {}

  /**
   * Get the singleton instance
   */
  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config()
    }
    return Config.instance
  }

  /**
   * Initialize configuration with validation
   * Must be called once at application startup
   */
  initialize(): { isSuccess: boolean; isFailure: boolean; error?: string } {
    try {
      // Bun automatically loads .env files, so process.env is already populated
      const rawEnv = process.env

      // Use Zod for validation and parsing with automatic coercion
      const parseResult = EnvSchema.safeParse(rawEnv)

      if (!parseResult.success) {
        const errorMessages = parseResult.error.issues
          .map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
          .join(', ')
        return {
          isSuccess: false,
          isFailure: true,
          error: `Environment validation failed: ${errorMessages}`,
        }
      }

      const decodedEnv = parseResult.data

      // Production-specific validations
      if (decodedEnv.NODE_ENV === 'production') {
        const productionValidation = this.validateProductionConfig(decodedEnv)
        if (productionValidation.isFailure) {
          return productionValidation
        }
      }

      this.env = decodedEnv
      this.validated = true

      logger.info('Configuration initialized successfully', {
        environment: decodedEnv.NODE_ENV,
        port: decodedEnv.PORT,
        logLevel: decodedEnv.LOG_LEVEL,
      })

      return { isSuccess: true, isFailure: false }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown configuration error'
      logger.error('Failed to initialize configuration', new Error(message))
      return {
        isSuccess: false,
        isFailure: true,
        error: `Configuration initialization failed: ${message}`,
      }
    }
  }

  /**
   * Validate production-specific requirements
   */
  private validateProductionConfig(env: Env): {
    isSuccess: boolean
    isFailure: boolean
    error?: string
  } {
    // Use Zod production schema for comprehensive validation
    const productionResult = ProductionEnvSchema.safeParse(env)

    if (!productionResult.success) {
      const errorMessages = productionResult.error.issues
        .map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
        .join('\n')

      return {
        isSuccess: false,
        isFailure: true,
        error: `Production configuration validation failed:\n${errorMessages}`,
      }
    }

    // Additional production-specific checks (if needed beyond Zod schema)
    const errors: string[] = []

    // Ensure SSL is enabled for database in production
    if (!env.POSTGRES_SSL) {
      errors.push('POSTGRES_SSL must be enabled in production')
    }

    // Ensure proper log format in production
    if (env.LOG_FORMAT !== 'json') {
      errors.push('LOG_FORMAT must be "json" in production')
    }

    if (errors.length > 0) {
      return {
        isSuccess: false,
        isFailure: true,
        error: `Production configuration validation failed:\n${errors.join('\n')}`,
      }
    }

    return { isSuccess: true, isFailure: false }
  }

  /**
   * Get the validated environment configuration
   * Throws if not initialized or validation failed
   */
  getEnv(): Env {
    if (!this.validated || !this.env) {
      throw new Error('Configuration not initialized. Call initialize() first.')
    }
    return this.env
  }

  /**
   * Check if configuration is initialized and valid
   */
  isInitialized(): boolean {
    return this.validated && this.env !== null
  }

  /**
   * Get a specific configuration value
   */
  get<K extends keyof Env>(key: K): Env[K] {
    return this.getEnv()[key]
  }

  /**
   * Get the current environment
   */
  getEnvironment(): 'development' | 'staging' | 'production' | 'test' {
    return this.getEnv().NODE_ENV
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return this.getEnvironment() === 'production'
  }

  /**
   * Check if running in development
   */
  isDevelopment(): boolean {
    return this.getEnvironment() === 'development'
  }

  /**
   * Check if running in test
   */
  isTest(): boolean {
    return this.getEnvironment() === 'test'
  }

  /**
   * Get database connection URL
   * Constructs from individual database fields
   */
  getDatabaseUrl(): string {
    const env = this.getEnv()

    // Construct from individual fields
    const auth = `${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}`
    const host = `${env.POSTGRES_HOST}:${env.POSTGRES_PORT}`
    const database = env.POSTGRES_DB
    const sslParam = env.POSTGRES_SSL ? '?sslmode=require' : ''

    return `postgresql://${auth}@${host}/${database}${sslParam}`
  }

  /**
   * Get Redis connection options
   */
  getRedisOptions() {
    const env = this.getEnv()
    return {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD,
      db: env.REDIS_DB,
    }
  }

  /**
   * Get queue configuration
   */
  getQueueConfig() {
    // Using defaults since these aren't in the env schema yet
    return {
      concurrency: 5,
      maxJobsPerWorker: 100,
      stalledInterval: 30000,
      removeOnComplete: {
        age: 3600,
        count: 100,
      },
      removeOnFail: {
        age: 86400,
        count: 1000,
      },
    }
  }

  /**
   * Get safe configuration for logging (excludes sensitive data)
   */
  getSafeConfig(): Partial<Env> {
    const env = this.getEnv()
    return {
      NODE_ENV: env.NODE_ENV,
      PORT: env.PORT,
      POSTGRES_HOST: env.POSTGRES_HOST,
      POSTGRES_PORT: env.POSTGRES_PORT,
      POSTGRES_DB: env.POSTGRES_DB,
      POSTGRES_SSL: env.POSTGRES_SSL,
      REDIS_HOST: env.REDIS_HOST,
      REDIS_PORT: env.REDIS_PORT,
      REDIS_DB: env.REDIS_DB,
      LOG_LEVEL: env.LOG_LEVEL,
      LOG_FORMAT: env.LOG_FORMAT,
      ENABLE_CORS: env.ENABLE_CORS,
      ENABLE_RATE_LIMITING: env.ENABLE_RATE_LIMITING,
      ENABLE_API_DOCS: env.ENABLE_API_DOCS,
    }
  }

  /**
   * Reset the singleton (mainly for testing)
   */
  static reset(): void {
    if (Config.instance) {
      Config.instance.env = null
      Config.instance.validated = false
    }
    Config.instance = null
  }
}

/**
 * Export singleton instance
 */
export const config = Config.getInstance()
