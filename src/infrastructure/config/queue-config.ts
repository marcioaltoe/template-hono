import { config as appConfig } from './config'

/**
 * Queue-specific configuration
 * Provides simplified access to queue settings
 */
export const config = {
  get redis() {
    return appConfig.getRedisOptions()
  },

  get queue() {
    return appConfig.getQueueConfig()
  },

  get isDevelopment() {
    return appConfig.isDevelopment()
  },

  get isProduction() {
    return appConfig.isProduction()
  },

  get isTest() {
    return appConfig.isTest()
  },
}
