import type { Config } from 'drizzle-kit'

import { config } from 'dotenv'

export interface DBConnectionConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
  ssl: boolean
}

// Carrega variáveis de ambiente da raiz do projeto
console.info('🔐 Carregando variáveis de ambiente do arquivo .env')
config({ path: '.env.development' })

// Cria conexão básica com variáveis de ambiente
const dbConfig: DBConnectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number.parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'hono_db',
  ssl: process.env.DB_SSL === 'true',
}

// Note: drizzle-kit runs independently and doesn't load our config module
// So we still need to read from process.env directly here
// Bun will automatically load .env files

export default {
  schema: 'src/infrastructure/database/drizzle/schema/*.schema.ts',
  out: 'src/infrastructure/database/drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    ...dbConfig,
  },
  migrations: {
    table: 'drizzle_migrations',
    schema: 'public',
  },
  tablesFilter: ['!pg_stat_*'],
  verbose: true,
  strict: true,
} satisfies Config
