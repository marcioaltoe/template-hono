import { Result, ValueObject } from '@/domain/building-blocks'

interface CNPJProps {
  value: string
}

export class CNPJ extends ValueObject<CNPJProps> {
  private constructor(props: CNPJProps) {
    super(props)
  }

  protected validate(props: CNPJProps): Result<void> {
    if (!CNPJ.isValid(props.value)) {
      return Result.fail<void>('Invalid CNPJ')
    }
    return Result.ok<void>()
  }

  get value(): string {
    return this.props.value
  }

  static create(cnpj: string): Result<CNPJ> {
    const cleaned = cnpj.replace(/\D/g, '')

    if (!this.isValid(cleaned)) {
      return Result.fail<CNPJ>('Invalid CNPJ')
    }

    return Result.ok<CNPJ>(new CNPJ({ value: cleaned }))
  }

  private static isValid(cnpj: string): boolean {
    if (cnpj.length !== 14) return false

    // Check for known invalid patterns
    if (/^(\d)\1+$/.test(cnpj)) return false

    // Validate check digits
    const digits = cnpj.split('').map(Number)

    // First check digit
    const factors1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    let sum1 = 0
    for (let i = 0; i < 12; i++) {
      const digit = digits[i]
      const factor = factors1[i]
      if (digit === undefined || factor === undefined) return false
      sum1 += digit * factor
    }
    const check1 = sum1 % 11 < 2 ? 0 : 11 - (sum1 % 11)
    const checkDigit1 = digits[12]
    if (checkDigit1 === undefined || check1 !== checkDigit1) return false

    // Second check digit
    const factors2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    let sum2 = 0
    for (let i = 0; i < 13; i++) {
      const digit = digits[i]
      const factor = factors2[i]
      if (digit === undefined || factor === undefined) return false
      sum2 += digit * factor
    }
    const check2 = sum2 % 11 < 2 ? 0 : 11 - (sum2 % 11)
    const checkDigit2 = digits[13]

    return checkDigit2 !== undefined && check2 === checkDigit2
  }

  format(): string {
    const value = this.props.value
    return `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(5, 8)}/${value.slice(8, 12)}-${value.slice(12, 14)}`
  }

  mask(): string {
    const value = this.props.value
    return `**.***.***/****-${value.slice(-2)}`
  }
}
