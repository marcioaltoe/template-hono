import { z } from 'zod'

/**
 * Environment configuration schema using Zod
 * Validates and automatically coerces environment variables with type safety
 */
export const EnvSchema = z.object({
  // Application Configuration
  NODE_ENV: z
    .enum(['development', 'staging', 'production', 'test'])
    .default('development')
    .describe('Application environment'),

  PORT: z.coerce
    .number()
    .min(1, 'Port must be greater than 0')
    .max(65535, 'Port must be less than 65536')
    .default(3000)
    .describe('Server port'),

  // Database Configuration - Support both URL and individual fields
  POSTGRES_HOST: z
    .string()
    .min(1, 'PostgreSQL host is required')
    .default('localhost')
    .describe('PostgreSQL host'),

  POSTGRES_PORT: z.coerce
    .number()
    .min(1, 'PostgreSQL port must be greater than 0')
    .max(65535, 'PostgreSQL port must be less than 65536')
    .default(5432)
    .describe('PostgreSQL port'),

  POSTGRES_DB: z
    .string()
    .min(1, 'PostgreSQL database name is required')
    .default('cerberus_dev')
    .describe('PostgreSQL database name'),

  POSTGRES_USER: z
    .string()
    .min(1, 'PostgreSQL username is required')
    .default('postgres')
    .describe('PostgreSQL username'),

  POSTGRES_PASSWORD: z
    .string()
    .min(1, 'PostgreSQL password is required')
    .default('postgres')
    .describe('PostgreSQL password'),

  POSTGRES_SSL: z
    .string()
    .default('false')
    .transform((val) => val === 'true' || val === '1')
    .describe('Enable SSL for PostgreSQL'),

  POSTGRES_MAX_CONNECTIONS: z.coerce
    .number()
    .min(1, 'Max connections must be at least 1')
    .max(1000, 'Max connections cannot exceed 1000')
    .default(20)
    .describe('PostgreSQL max connections'),

  // Application Server Configuration
  HOST: z
    .string()
    .refine(
      (val) => val === '0.0.0.0' || val === 'localhost' || /^(\d{1,3}\.){3}\d{1,3}$/.test(val),
      'Must be a valid IP address or localhost',
    )
    .default('0.0.0.0')
    .describe('Server host'),

  CORS_ORIGINS: z
    .string()
    .min(1, 'CORS origins is required')
    .default('http://localhost:3000')
    .describe('CORS allowed origins (comma-separated)'),

  // Redis Configuration
  REDIS_HOST: z
    .string()
    .min(1, 'Redis host is required')
    .default('localhost')
    .describe('Redis host'),

  REDIS_PORT: z.coerce
    .number()
    .min(1, 'Redis port must be greater than 0')
    .max(65535, 'Redis port must be less than 65536')
    .default(6379)
    .describe('Redis port'),

  REDIS_PASSWORD: z.string().optional().describe('Redis password (optional)'),

  REDIS_DB: z.coerce
    .number()
    .min(0, 'Redis DB must be non-negative')
    .max(15, 'Redis DB cannot exceed 15')
    .default(0)
    .describe('Redis database number'),

  // Security Configuration
  JWT_SECRET: z
    .string()
    .min(32, 'JWT secret must be at least 32 characters')
    .default('dev_jwt_secret_key_at_least_32_characters_long')
    .describe('JWT signing secret (min 32 chars in production)'),

  ENCRYPTION_KEY: z
    .string()
    .min(32, 'Encryption key must be at least 32 characters')
    .default('dev_encryption_key_at_least_32_chars_long')
    .describe('Data encryption key (min 32 chars in production)'),

  API_KEY_SALT: z
    .string()
    .min(16, 'API key salt must be at least 16 characters')
    .default('dev_salt_16_chars')
    .describe('API key hashing salt (min 16 chars)'),

  // Logging Configuration
  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'debug', 'silly'])
    .default('info')
    .describe('Logging level'),

  LOG_FORMAT: z.enum(['json', 'pretty']).default('json').describe('Log output format'),

  // Feature Flags
  ENABLE_CORS: z
    .string()
    .default('true')
    .transform((val) => val === 'true' || val === '1')
    .describe('Enable CORS'),

  ENABLE_RATE_LIMITING: z
    .string()
    .default('true')
    .transform((val) => val === 'true' || val === '1')
    .describe('Enable rate limiting'),

  ENABLE_API_DOCS: z
    .string()
    .default('true')
    .transform((val) => val === 'true' || val === '1')
    .describe('Enable API documentation endpoints'),
})

/**
 * TypeScript type inferred from the Zod schema
 */
export type Env = z.infer<typeof EnvSchema>

/**
 * Production-specific validation rules
 * Applied as additional refinements in production environment
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

/**
 * Production environment schema with additional security validations
 */
export const ProductionEnvSchema = EnvSchema.refine(
  (data) => {
    if (data.NODE_ENV === 'production') {
      return !ProductionConstraints.FORBIDDEN_DEFAULTS.includes(data.JWT_SECRET)
    }
    return true
  },
  {
    message: 'JWT_SECRET must not use development default in production',
    path: ['JWT_SECRET'],
  },
)
  .refine(
    (data) => {
      if (data.NODE_ENV === 'production') {
        return !ProductionConstraints.FORBIDDEN_DEFAULTS.includes(data.ENCRYPTION_KEY)
      }
      return true
    },
    {
      message: 'ENCRYPTION_KEY must not use development default in production',
      path: ['ENCRYPTION_KEY'],
    },
  )
  .refine(
    (data) => {
      if (data.NODE_ENV === 'production') {
        return !ProductionConstraints.FORBIDDEN_DEFAULTS.includes(data.API_KEY_SALT)
      }
      return true
    },
    {
      message: 'API_KEY_SALT must not use development default in production',
      path: ['API_KEY_SALT'],
    },
  )
