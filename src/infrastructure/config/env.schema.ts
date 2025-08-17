import { type Static, Type } from '@sinclair/typebox'

/**
 * Environment configuration schema using TypeBox
 * Validates and transforms environment variables with type safety
 */
export const EnvSchema = Type.Object({
  // Application Configuration
  NODE_ENV: Type.Union(
    [
      Type.Literal('development'),
      Type.Literal('staging'),
      Type.Literal('production'),
      Type.Literal('test'),
    ],
    {
      default: 'development',
      description: 'Application environment',
    },
  ),

  PORT: Type.Transform(
    Type.String({
      default: '3000',
      description: 'Server port',
    }),
  )
    .Decode((value) => {
      const port = parseInt(value, 10)
      if (Number.isNaN(port) || port < 1 || port > 65535) {
        throw new Error(`Invalid port: ${value}`)
      }
      return port
    })
    .Encode((value) => value.toString()),

  // Database Configuration - Support both URL and individual fields
  DATABASE_URL: Type.Optional(
    Type.String({
      description: 'Full PostgreSQL connection URL (overrides individual fields)',
    }),
  ),

  POSTGRES_HOST: Type.String({
    default: 'localhost',
    description: 'PostgreSQL host',
  }),

  POSTGRES_PORT: Type.Transform(
    Type.String({
      default: '5432',
      description: 'PostgreSQL port',
    }),
  )
    .Decode((value) => {
      const port = parseInt(value, 10)
      if (Number.isNaN(port) || port < 1 || port > 65535) {
        throw new Error(`Invalid PostgreSQL port: ${value}`)
      }
      return port
    })
    .Encode((value) => value.toString()),

  POSTGRES_DB: Type.String({
    default: 'hono_db',
    description: 'PostgreSQL database name',
  }),

  POSTGRES_USER: Type.String({
    default: 'postgres',
    description: 'PostgreSQL username',
  }),

  POSTGRES_PASSWORD: Type.String({
    default: 'postgres',
    description: 'PostgreSQL password',
  }),

  POSTGRES_SSL: Type.Transform(
    Type.String({
      default: 'false',
      description: 'Enable SSL for PostgreSQL',
    }),
  )
    .Decode((value) => value === 'true' || value === '1')
    .Encode((value) => (value ? 'true' : 'false')),

  // Redis Configuration
  REDIS_HOST: Type.String({
    default: 'localhost',
    description: 'Redis host',
  }),

  REDIS_PORT: Type.Transform(
    Type.String({
      default: '6379',
      description: 'Redis port',
    }),
  )
    .Decode((value) => {
      const port = parseInt(value, 10)
      if (Number.isNaN(port) || port < 1 || port > 65535) {
        throw new Error(`Invalid Redis port: ${value}`)
      }
      return port
    })
    .Encode((value) => value.toString()),

  REDIS_PASSWORD: Type.Optional(
    Type.String({
      description: 'Redis password (optional)',
    }),
  ),

  REDIS_DB: Type.Transform(
    Type.String({
      default: '0',
      description: 'Redis database number',
    }),
  )
    .Decode((value) => {
      const db = parseInt(value, 10)
      if (Number.isNaN(db) || db < 0 || db > 15) {
        throw new Error(`Invalid Redis DB: ${value}`)
      }
      return db
    })
    .Encode((value) => value.toString()),

  // Security Configuration
  JWT_SECRET: Type.String({
    default: 'dev_jwt_secret_key_at_least_32_characters_long',
    description: 'JWT signing secret (min 32 chars in production)',
  }),

  ENCRYPTION_KEY: Type.String({
    default: 'dev_encryption_key_at_least_32_chars_long',
    description: 'Data encryption key (min 32 chars in production)',
  }),

  API_KEY_SALT: Type.String({
    default: 'dev_salt_16_chars',
    description: 'API key hashing salt (min 16 chars)',
  }),

  // Logging Configuration
  LOG_LEVEL: Type.Union(
    [
      Type.Literal('error'),
      Type.Literal('warn'),
      Type.Literal('info'),
      Type.Literal('debug'),
      Type.Literal('silly'),
    ],
    {
      default: 'info',
      description: 'Logging level',
    },
  ),

  LOG_FORMAT: Type.Union([Type.Literal('json'), Type.Literal('pretty')], {
    default: 'json',
    description: 'Log output format',
  }),

  // Feature Flags
  ENABLE_CORS: Type.Transform(
    Type.String({
      default: 'true',
      description: 'Enable CORS',
    }),
  )
    .Decode((value) => value === 'true' || value === '1')
    .Encode((value) => (value ? 'true' : 'false')),

  ENABLE_RATE_LIMITING: Type.Transform(
    Type.String({
      default: 'true',
      description: 'Enable rate limiting',
    }),
  )
    .Decode((value) => value === 'true' || value === '1')
    .Encode((value) => (value ? 'true' : 'false')),

  ENABLE_API_DOCS: Type.Transform(
    Type.String({
      default: 'true',
      description: 'Enable API documentation endpoints',
    }),
  )
    .Decode((value) => value === 'true' || value === '1')
    .Encode((value) => (value ? 'true' : 'false')),
})

/**
 * TypeScript type inferred from the schema
 */
export type Env = Static<typeof EnvSchema>

/**
 * Production-specific validation rules
 */
export const ProductionConstraints = {
  JWT_SECRET_MIN_LENGTH: 32,
  ENCRYPTION_KEY_MIN_LENGTH: 32,
  API_KEY_SALT_MIN_LENGTH: 16,
  FORBIDDEN_DEFAULTS: [
    'dev_jwt_secret_key_at_least_32_characters_long',
    'dev_encryption_key_at_least_32_chars_long',
    'dev_salt_16_chars',
    'dev_access_key',
    'dev_secret_key',
  ],
}
