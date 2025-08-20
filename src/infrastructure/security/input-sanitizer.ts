/**
 * Input sanitization service for security
 */
export class InputSanitizer {
  /**
   * Sanitizes HTML content to prevent XSS
   */
  static sanitizeHTML(html: string): string {
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\//g, '&#x2F;')
  }

  /**
   * Removes potentially dangerous characters from user input
   */
  static sanitizeUserInput(input: string): string {
    return input
      .replace(/[<>'"]/g, '') // Remove potential HTML/JS injection characters
      .replace(this.getControlCharacterRegex(), '') // Remove control characters
      .trim()
  }

  /**
   * Returns regex pattern for control characters
   */
  private static getControlCharacterRegex(): RegExp {
    // Create regex programmatically to avoid control characters in source
    const controlChars = []
    for (let i = 0; i <= 31; i++) {
      controlChars.push(String.fromCharCode(i))
    }
    controlChars.push(String.fromCharCode(127)) // DEL character

    const escapedChars = controlChars
      .map((char) => char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('')

    return new RegExp(`[${escapedChars}]`, 'g')
  }

  /**
   * Sanitizes SQL input to prevent injection
   * Note: This is basic - always use parameterized queries instead
   */
  static sanitizeSQL(value: string): string {
    return value
      .replace(/'/g, "''")
      .replace(/;/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
  }

  /**
   * Sanitizes a filename
   */
  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase()
  }

  /**
   * Sanitizes URL
   */
  static sanitizeURL(url: string): string {
    try {
      const parsed = new URL(url)
      return parsed.toString()
    } catch {
      return ''
    }
  }

  /**
   * Removes extra whitespaces and trims
   */
  static normalizeWhitespace(value: string): string {
    return value.replace(/\s+/g, ' ').trim()
  }

  /**
   * Removes accents from text
   */
  static removeAccents(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }
}
