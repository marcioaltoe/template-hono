export class Result<T> {
  public readonly isSuccess: boolean
  public readonly isFailure: boolean
  public readonly error?: string
  private readonly _value?: T

  private constructor(isSuccess: boolean, error?: string, value?: T) {
    if (isSuccess && error) {
      throw new Error('InvalidOperation: A result cannot be successful and contain an error')
    }
    if (!isSuccess && !error) {
      throw new Error('InvalidOperation: A failing result needs to contain an error message')
    }

    this.isSuccess = isSuccess
    this.isFailure = !isSuccess
    this.error = error
    this._value = value

    Object.freeze(this)
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error(`Can't get the value of an error result. Use 'errorValue' instead.`)
    }

    return this._value as T
  }

  public getErrorValue(): string {
    return this.error as string
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value)
  }

  public static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error)
  }

  public static combine(results: Result<any>[]): Result<any> {
    for (const result of results) {
      if (result.isFailure) return result
    }
    return Result.ok()
  }

  // Type guards for better TypeScript support
  public isOk(): this is Result<T> & { isSuccess: true; isFailure: false } {
    return this.isSuccess
  }

  public isFail(): this is Result<T> & { isSuccess: false; isFailure: true; error: string } {
    return this.isFailure
  }

  // Functional methods for chaining
  public map<U>(fn: (value: T) => U): Result<U> {
    if (this.isFailure) {
      return Result.fail<U>(this.getErrorValue())
    }
    return Result.ok<U>(fn(this.getValue()))
  }

  public flatMap<U>(fn: (value: T) => Result<U>): Result<U> {
    if (this.isFailure) {
      return Result.fail<U>(this.getErrorValue())
    }
    return fn(this.getValue())
  }

  public mapError(fn: (error: string) => string): Result<T> {
    if (this.isSuccess) {
      return Result.ok<T>(this._value)
    }
    return Result.fail<T>(fn(this.getErrorValue()))
  }

  // Async utilities
  public static async combineAsync(results: Promise<Result<any>>[]): Promise<Result<any>> {
    const resolvedResults = await Promise.all(results)
    return Result.combine(resolvedResults)
  }
}
