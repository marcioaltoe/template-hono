import { config } from './config'

/**
 * Queue-specific configuration
 * Provides simplified access to queue settings
 */
export const queueConfig = {
  get redis() {
    return config.getRedisOptions()
  },

  get queue() {
    return config.getQueueConfig()
  },

  get isDevelopment() {
    return config.isDevelopment()
  },

  get isProduction() {
    return config.isProduction()
  },

  get isTest() {
    return config.isTest()
  },
}
