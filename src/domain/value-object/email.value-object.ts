import { Result, ValueObject } from '@/domain/building-blocks'

interface EmailProps {
  value: string
}

export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props)
  }

  protected validate(props: EmailProps): Result<void> {
    if (!Email.isValid(props.value)) {
      return Result.fail<void>('Invalid email address')
    }
    return Result.ok<void>()
  }

  get value(): string {
    return this.props.value
  }

  static create(email: string): Result<Email> {
    const normalized = email.toLowerCase().trim()

    if (!this.isValid(normalized)) {
      return Result.fail<Email>('Invalid email address')
    }

    return Result.ok<Email>(new Email({ value: normalized }))
  }

  private static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  getDomain(): string {
    return this.props.value.split('@')[1] || ''
  }

  getLocal(): string {
    return this.props.value.split('@')[0] || ''
  }

  mask(): string {
    const parts = this.props.value.split('@')
    if (parts.length !== 2) return '***'

    const [local, domain] = parts
    if (!local || !domain) return '***'

    const maskedLocal =
      local.length > 2
        ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
        : '*'.repeat(local.length)

    return `${maskedLocal}@${domain}`
  }
}
