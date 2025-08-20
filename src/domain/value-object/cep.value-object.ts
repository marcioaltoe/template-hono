import { Result, ValueObject } from '@/domain/building-blocks'

interface CEPProps {
  value: string
}

export class CEP extends ValueObject<CEPProps> {
  private constructor(props: CEPProps) {
    super(props)
  }

  protected validate(props: CEPProps): Result<void> {
    if (!CEP.isValid(props.value)) {
      return Result.fail<void>('Invalid CEP')
    }
    return Result.ok<void>()
  }

  get value(): string {
    return this.props.value
  }

  static create(cep: string): Result<CEP> {
    const cleaned = cep.replace(/\D/g, '')

    if (!this.isValid(cleaned)) {
      return Result.fail<CEP>('Invalid CEP')
    }

    return Result.ok<CEP>(new CEP({ value: cleaned }))
  }

  private static isValid(cep: string): boolean {
    return cep.length === 8
  }

  format(): string {
    const value = this.props.value
    return `${value.slice(0, 5)}-${value.slice(5, 8)}`
  }
}
