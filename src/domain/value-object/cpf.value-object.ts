import { Result, ValueObject } from '@/domain/building-blocks'

interface CPFProps {
  value: string
}

export class CPF extends ValueObject<CPFProps> {
  private constructor(props: CPFProps) {
    super(props)
  }

  protected validate(props: CPFProps): Result<void> {
    if (!CPF.isValid(props.value)) {
      return Result.fail<void>('Invalid CPF')
    }
    return Result.ok<void>()
  }

  get value(): string {
    return this.props.value
  }

  static create(cpf: string): Result<CPF> {
    const cleaned = cpf.replace(/\D/g, '')

    if (!this.isValid(cleaned)) {
      return Result.fail<CPF>('Invalid CPF')
    }

    return Result.ok<CPF>(new CPF({ value: cleaned }))
  }

  private static isValid(cpf: string): boolean {
    if (cpf.length !== 11) return false

    // Check for known invalid patterns
    if (/^(\d)\1+$/.test(cpf)) return false

    // Validate check digits
    const digits = cpf.split('').map(Number)

    // First check digit
    let sum1 = 0
    for (let i = 0; i < 9; i++) {
      const digit = digits[i]
      if (digit === undefined) return false
      sum1 += digit * (10 - i)
    }
    const check1 = sum1 % 11 < 2 ? 0 : 11 - (sum1 % 11)
    const checkDigit1 = digits[9]
    if (checkDigit1 === undefined || check1 !== checkDigit1) return false

    // Second check digit
    let sum2 = 0
    for (let i = 0; i < 10; i++) {
      const digit = digits[i]
      if (digit === undefined) return false
      sum2 += digit * (11 - i)
    }
    const check2 = sum2 % 11 < 2 ? 0 : 11 - (sum2 % 11)
    const checkDigit2 = digits[10]

    return checkDigit2 !== undefined && check2 === checkDigit2
  }

  format(): string {
    const value = this.props.value
    return `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9, 11)}`
  }

  mask(): string {
    const value = this.props.value
    return `***.***.***-${value.slice(-2)}`
  }
}
