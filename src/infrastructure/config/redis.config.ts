import Redis from 'ioredis'

import { logger } from '@/infrastructure/logging'

import { config } from './config'

export interface RedisConfig {
  host: string
  port: number
  password?: string
  db: number
  retryStrategy?: (times: number) => number | undefined
  maxRetriesPerRequest?: number
  enableReadyCheck?: boolean
  lazyConnect?: boolean
}

export function getRedisConfig(): RedisConfig {
  const redisOptions = config.getRedisOptions()
  return {
    host: redisOptions.host,
    port: redisOptions.port,
    password: redisOptions.password,
    db: redisOptions.db,
    retryStrategy: (times: number) => {
      if (times > 3) {
        logger.error('Redis connection failed after 3 retries')
        return undefined // Stop retrying
      }
      const delay = Math.min(times * 50, 2000)
      return delay
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  }
}

export function createRedisConnection(config: RedisConfig): Redis {
  const redis = new Redis(config)

  redis.on('connect', () => {
    logger.info('Redis connected')
  })

  redis.on('error', (error) => {
    logger.error('Redis connection error', error)
  })

  redis.on('ready', () => {
    logger.info('Redis ready to accept commands')
  })

  return redis
}
