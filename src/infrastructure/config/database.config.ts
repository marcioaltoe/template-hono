import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { logger } from '@/infrastructure/logging'

import { config } from './config'

/**
 * Database configuration factory
 * Creates and manages database connections using the centralized config
 */
export class DatabaseConfig {
  private static connection: postgres.Sql | null = null

  /**
   * Get database connection configuration
   */
  static getConnectionConfig() {
    const env = config.getEnv()

    // Build configuration from database fields
    return {
      host: env.POSTGRES_HOST,
      port: env.POSTGRES_PORT, // Already a number from Zod coerce
      database: env.POSTGRES_DB,
      username: env.POSTGRES_USER,
      password: env.POSTGRES_PASSWORD,
      ssl: env.POSTGRES_SSL ? { rejectUnauthorized: true } : false,
      max: env.POSTGRES_MAX_CONNECTIONS,
      idle_timeout: 20,
      connect_timeout: 10,
    }
  }

  /**
   * Create a new database connection
   * Returns existing connection if already created (singleton pattern)
   */
  static getConnection(): postgres.Sql {
    if (!DatabaseConfig.connection) {
      const connectionConfig = DatabaseConfig.getConnectionConfig()

      // Create postgres connection with individual fields
      DatabaseConfig.connection = postgres(
        connectionConfig as postgres.Options<Record<string, never>>,
      )

      logger.info('Database connection created', {
        host: connectionConfig.host,
        database: connectionConfig.database,
        ssl: Boolean(connectionConfig.ssl),
      })
    }

    return DatabaseConfig.connection
  }

  /**
   * Get Drizzle ORM instance
   */
  static getDrizzle() {
    const sql = DatabaseConfig.getConnection()
    return drizzle(sql)
  }

  /**
   * Test database connection
   */
  static async testConnection(): Promise<{
    isSuccess: boolean
    isFailure: boolean
    error?: string
  }> {
    try {
      const sql = DatabaseConfig.getConnection()

      // Execute a simple query to test connection
      const result = await sql`SELECT 1 as connected`

      if (result && result[0]?.connected === 1) {
        logger.info('Database connection test successful')
        return { isSuccess: true, isFailure: false }
      }

      return {
        isSuccess: false,
        isFailure: true,
        error: 'Database connection test failed: Invalid response',
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown database error'
      logger.error('Database connection test failed', new Error(message))
      return { isSuccess: false, isFailure: true, error: `Database connection failed: ${message}` }
    }
  }

  /**
   * Close database connection
   */
  static async close(): Promise<void> {
    if (DatabaseConfig.connection) {
      await DatabaseConfig.connection.end()
      DatabaseConfig.connection = null
      logger.info('Database connection closed')
    }
  }

  /**
   * Get connection URL for migrations and external tools
   */
  static getConnectionUrl(): string {
    return config.getDatabaseUrl()
  }

  /**
   * Reset connection (mainly for testing)
   */
  static reset(): void {
    DatabaseConfig.connection = null
  }
}
