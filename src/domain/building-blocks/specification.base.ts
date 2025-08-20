/**
 * Specification pattern for encapsulating business rules
 * Specifications can be combined using logical operators
 */
export abstract class Specification<T> {
  /**
   * Checks if the candidate satisfies the specification
   */
  abstract isSatisfiedBy(candidate: T): boolean

  /**
   * Creates a new specification that is satisfied when both this and other are satisfied
   */
  and(other: Specification<T>): Specification<T> {
    return new AndSpecification(this, other)
  }

  /**
   * Creates a new specification that is satisfied when either this or other is satisfied
   */
  or(other: Specification<T>): Specification<T> {
    return new OrSpecification(this, other)
  }

  /**
   * Creates a new specification that is satisfied when this is not satisfied
   */
  not(): Specification<T> {
    return new NotSpecification(this)
  }

  /**
   * Provides a reason why the specification is not satisfied
   * Override this to provide meaningful error messages
   */
  reasonForDissatisfaction(): string {
    return 'Specification not satisfied'
  }
}

/**
 * Composite specification that is satisfied when both specifications are satisfied
 */
class AndSpecification<T> extends Specification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>,
  ) {
    super()
  }

  override isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate)
  }

  override reasonForDissatisfaction(): string {
    return `${this.left.reasonForDissatisfaction()} AND ${this.right.reasonForDissatisfaction()}`
  }
}

/**
 * Composite specification that is satisfied when either specification is satisfied
 */
class OrSpecification<T> extends Specification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>,
  ) {
    super()
  }

  override isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate)
  }

  override reasonForDissatisfaction(): string {
    return `${this.left.reasonForDissatisfaction()} OR ${this.right.reasonForDissatisfaction()}`
  }
}

/**
 * Composite specification that is satisfied when the wrapped specification is not satisfied
 */
class NotSpecification<T> extends Specification<T> {
  constructor(private readonly wrapped: Specification<T>) {
    super()
  }

  override isSatisfiedBy(candidate: T): boolean {
    return !this.wrapped.isSatisfiedBy(candidate)
  }

  override reasonForDissatisfaction(): string {
    return `NOT ${this.wrapped.reasonForDissatisfaction()}`
  }
}

/**
 * Generic specification that uses a predicate function
 */
export class PredicateSpecification<T> extends Specification<T> {
  constructor(
    private readonly predicate: (candidate: T) => boolean,
    private readonly reason?: string,
  ) {
    super()
  }

  override isSatisfiedBy(candidate: T): boolean {
    return this.predicate(candidate)
  }

  override reasonForDissatisfaction(): string {
    return this.reason || super.reasonForDissatisfaction()
  }
}
