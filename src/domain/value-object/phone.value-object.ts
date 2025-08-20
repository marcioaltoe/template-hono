import { Result, ValueObject } from '@/domain/building-blocks'

interface PhoneProps {
  value: string
}

export class Phone extends ValueObject<PhoneProps> {
  private constructor(props: PhoneProps) {
    super(props)
  }

  protected validate(props: PhoneProps): Result<void> {
    if (!Phone.isValid(props.value)) {
      return Result.fail<void>('Invalid phone number')
    }
    return Result.ok<void>()
  }

  get value(): string {
    return this.props.value
  }

  static create(phone: string): Result<Phone> {
    const cleaned = phone.replace(/\D/g, '')

    if (!this.isValid(cleaned)) {
      return Result.fail<Phone>('Invalid phone number')
    }

    return Result.ok<Phone>(new Phone({ value: cleaned }))
  }

  private static isValid(phone: string): boolean {
    return phone.length === 10 || phone.length === 11
  }

  format(): string {
    const value = this.props.value
    if (value.length === 11) {
      return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`
    }
    if (value.length === 10) {
      return `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6, 10)}`
    }
    return value
  }

  isWhatsApp(): boolean {
    // In Brazil, mobile numbers (11 digits) can have WhatsApp
    return this.props.value.length === 11
  }
}
