import { Result, ValueObject } from '@/domain/building-blocks'

interface PasswordProps {
  value: string
  isHashed: boolean
}

export interface PasswordStrengthAnalysis {
  isValid: boolean
  score: number
  feedback: string[]
}

export class Password extends ValueObject<PasswordProps> {
  private static readonly MIN_LENGTH = 8

  private constructor(props: PasswordProps) {
    super(props)
  }

  protected validate(props: PasswordProps): Result<void> {
    if (props.isHashed) {
      return Result.ok<void>()
    }

    const analysis = Password.analyzeStrength(props.value)
    if (!analysis.isValid) {
      return Result.fail<void>(analysis.feedback.join('; '))
    }
    return Result.ok<void>()
  }

  get value(): string {
    return this.props.value
  }

  get isHashed(): boolean {
    return this.props.isHashed
  }

  static create(password: string, isHashed = false): Result<Password> {
    if (isHashed) {
      return Result.ok<Password>(new Password({ value: password, isHashed: true }))
    }

    const analysis = this.analyzeStrength(password)
    if (!analysis.isValid) {
      return Result.fail<Password>(analysis.feedback.join('; '))
    }

    return Result.ok<Password>(new Password({ value: password, isHashed: false }))
  }

  static createHashed(hashedPassword: string): Result<Password> {
    return Result.ok<Password>(new Password({ value: hashedPassword, isHashed: true }))
  }

  static analyzeStrength(password: string): PasswordStrengthAnalysis {
    const feedback: string[] = []
    let score = 0

    if (password.length < this.MIN_LENGTH) {
      feedback.push(`Password must be at least ${this.MIN_LENGTH} characters long`)
    } else {
      score++
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Password must contain at least one lowercase letter')
    } else {
      score++
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Password must contain at least one uppercase letter')
    } else {
      score++
    }

    if (!/\d/.test(password)) {
      feedback.push('Password must contain at least one number')
    } else {
      score++
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('Password should contain at least one special character')
    } else {
      score++
    }

    return {
      isValid: feedback.length === 0,
      score,
      feedback,
    }
  }
}
