/**
 * Data masking service for privacy and security
 */
export class DataMasker {
  /**
   * Masks sensitive data with asterisks
   */
  static maskSensitiveData(data: string, visibleChars = 4): string {
    if (data.length <= visibleChars) {
      return '*'.repeat(data.length)
    }

    const masked = '*'.repeat(data.length - visibleChars)
    return masked + data.slice(-visibleChars)
  }

  /**
   * Masks credit card number
   */
  static maskCreditCard(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '')
    if (cleaned.length < 12) return '*'.repeat(cleaned.length)

    return `****-****-****-${cleaned.slice(-4)}`
  }

  /**
   * Masks API key
   */
  static maskApiKey(apiKey: string): string {
    if (apiKey.length <= 8) return '*'.repeat(apiKey.length)

    return apiKey.slice(0, 4) + '*'.repeat(apiKey.length - 8) + apiKey.slice(-4)
  }

  /**
   * Masks JWT token
   */
  static maskToken(token: string): string {
    const parts = token.split('.')
    if (parts.length !== 3) return this.maskSensitiveData(token, 10)

    const [header, payload, signature] = parts
    if (!header || !payload || !signature) return this.maskSensitiveData(token, 10)

    // Show only part of the signature
    return `${header}.${payload}.${signature.slice(0, 10)}...`
  }

  /**
   * Redacts sensitive fields from objects
   */
  static redactObject<T extends Record<string, any>>(
    obj: T,
    sensitiveFields: string[] = ['password', 'token', 'apiKey', 'secret', 'authorization'],
  ): T {
    const redacted = { ...obj }

    for (const key in redacted) {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
        ;(redacted as any)[key] = '[REDACTED]'
      } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
        redacted[key] = this.redactObject(redacted[key], sensitiveFields)
      }
    }

    return redacted
  }
}
