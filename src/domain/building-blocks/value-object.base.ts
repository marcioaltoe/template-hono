import { Result } from './result'

interface ValueObjectProps {
  [key: string]: any
}

/**
 * ValueObject base class implementing immutability and structural equality
 */
export abstract class ValueObject<T extends ValueObjectProps> {
  protected readonly props: T

  constructor(props: T) {
    const guardResult = this.validate(props)
    if (guardResult.isFailure) {
      throw new Error(guardResult.error)
    }

    this.props = Object.freeze(props)
  }

  /**
   * Abstract validation method that must be implemented by concrete value objects
   */
  protected abstract validate(props: T): Result<void>

  /**
   * Structural equality comparison
   * Two value objects are equal if all their properties are equal
   */
  public equals(valueObject?: ValueObject<T>): boolean {
    if (valueObject === null || valueObject === undefined) {
      return false
    }

    if (valueObject.props === undefined) {
      return false
    }

    // Use structural comparison instead of JSON.stringify
    return this.shallowEqual(this.props, valueObject.props)
  }

  /**
   * Performs a shallow structural equality check
   * For deep equality, override this method in specific value objects
   */
  private shallowEqual(obj1: T, obj2: T): boolean {
    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)

    if (keys1.length !== keys2.length) {
      return false
    }

    for (const key of keys1) {
      const val1 = obj1[key]
      const val2 = obj2[key]

      // Handle different types properly
      if (val1 instanceof Date && val2 instanceof Date) {
        if (val1.getTime() !== val2.getTime()) return false
      } else if (val1 instanceof ValueObject && val2 instanceof ValueObject) {
        if (!val1.equals(val2)) return false
      } else if (Array.isArray(val1) && Array.isArray(val2)) {
        if (!this.arrayEquals(val1, val2)) return false
      } else if (
        typeof val1 === 'object' &&
        val1 !== null &&
        typeof val2 === 'object' &&
        val2 !== null
      ) {
        // For nested objects, perform deep comparison
        if (!this.shallowEqual(val1, val2)) return false
      } else if (val1 !== val2) {
        return false
      }
    }

    return true
  }

  /**
   * Compares arrays for equality
   */
  private arrayEquals(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) return false

    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] instanceof ValueObject && arr2[i] instanceof ValueObject) {
        if (!arr1[i].equals(arr2[i])) return false
      } else if (arr1[i] !== arr2[i]) {
        return false
      }
    }

    return true
  }

  /**
   * Creates a copy of the value object with some properties changed
   * Returns a Result to handle validation errors
   */
  public copyWith(props: Partial<T>): Result<this> {
    const newProps = { ...this.props, ...props }
    try {
      // @ts-expect-error - This is safe because we're creating the same type
      return Result.ok(new this.constructor(newProps))
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Failed to create value object')
    }
  }
}
