import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { logger } from '../logging'
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

    // Use DATABASE_URL if provided, otherwise build from components
    if (env.DATABASE_URL) {
      return {
        connectionString: env.DATABASE_URL,
        max: 10, // connection pool size
        idle_timeout: 20,
        connect_timeout: 10,
      }
    }

    // Build configuration from individual fields
    return {
      host: env.POSTGRES_HOST,
      port: env.POSTGRES_PORT, // Already a number from TypeBox transform
      database: env.POSTGRES_DB,
      username: env.POSTGRES_USER,
      password: env.POSTGRES_PASSWORD,
      ssl: env.POSTGRES_SSL ? { rejectUnauthorized: true } : false,
      max: 10, // connection pool size
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

      // Create postgres connection
      if ('connectionString' in connectionConfig && connectionConfig.connectionString) {
        DatabaseConfig.connection = postgres(connectionConfig.connectionString, {
          max: connectionConfig.max,
          idle_timeout: connectionConfig.idle_timeout,
          connect_timeout: connectionConfig.connect_timeout,
        })
      } else {
        DatabaseConfig.connection = postgres(
          connectionConfig as postgres.Options<Record<string, never>>,
        )
      }

      logger.info('Database connection created', {
        host: connectionConfig.host || 'from-url',
        database: connectionConfig.database || 'from-url',
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
