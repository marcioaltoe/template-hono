export class LogSanitizer {
  private static sensitiveKeys = [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
    'cookie',
    'credit_card',
    'creditcard',
    'ssn',
    'api_key',
    'apikey',
    'private_key',
    'privatekey',
    'access_token',
    'accesstoken',
    'refresh_token',
    'refreshtoken',
    'bearer',
    'credentials',
    'passphrase',
  ]

  private static sensitivePatterns = [
    /^.*_secret$/i,
    /^.*_token$/i,
    /^.*_key$/i,
    /^.*password.*$/i,
    /^.*secret.*$/i,
    /^.*credential.*$/i,
  ]

  static sanitize(obj: unknown, depth = 0, maxDepth = 10): unknown {
    // Prevent infinite recursion
    if (depth > maxDepth) {
      return '[MAX_DEPTH_EXCEEDED]'
    }

    if (obj === null || obj === undefined) {
      return obj
    }

    // Handle primitive types
    if (typeof obj !== 'object') {
      return obj
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitize(item, depth + 1, maxDepth))
    }

    // Handle objects
    const sanitized: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase()

      // Check if key matches sensitive patterns
      if (this.isSensitiveKey(lowerKey)) {
        // If the value is an object, still redact it entirely for sensitive keys
        sanitized[key] = '[REDACTED]'
      } else if (typeof value === 'string' && this.looksLikeSensitiveValue(value)) {
        // Check if value looks like sensitive data
        sanitized[key] = '[REDACTED]'
      } else if (typeof value === 'object' && value !== null) {
        // Recursively sanitize nested objects
        sanitized[key] = this.sanitize(value, depth + 1, maxDepth)
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  private static isSensitiveKey(key: string): boolean {
    // Check exact matches
    if (this.sensitiveKeys.includes(key)) {
      return true
    }

    // Check if key contains sensitive words
    for (const sensitiveKey of this.sensitiveKeys) {
      if (key.includes(sensitiveKey)) {
        return true
      }
    }

    // Check patterns
    for (const pattern of this.sensitivePatterns) {
      if (pattern.test(key)) {
        return true
      }
    }

    return false
  }

  private static looksLikeSensitiveValue(value: string): boolean {
    // Skip short values (likely not secrets)
    if (value.length < 8) {
      return false
    }

    // Check for common token patterns
    const tokenPatterns = [
      /^Bearer\s+/i,
      /^Basic\s+/i,
      /^[A-Za-z0-9+/]{40,}={0,2}$/, // Base64-like
      /^[a-f0-9]{32,}$/i, // Hex string (MD5, SHA, etc.)
      /^ey[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/, // JWT
    ]

    for (const pattern of tokenPatterns) {
      if (pattern.test(value)) {
        return true
      }
    }

    return false
  }

  /**
   * Sanitize error objects specifically
   */
  static sanitizeError(error: Error): Record<string, unknown> {
    return {
      name: error.name,
      message: this.sanitize(error.message),
      stack: error.stack,
      ...(this.sanitize({ ...error }) as Record<string, unknown>),
    }
  }

  /**
   * Quick sanitize for performance-critical paths
   */
  static quickSanitize(obj: unknown): unknown {
    if (typeof obj !== 'object' || obj === null) {
      return obj
    }

    const sanitized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      if (this.isSensitiveKey(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }
}
