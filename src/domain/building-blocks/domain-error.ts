/**
 * Base class for domain errors
 * Domain errors represent business rule violations
 */
export abstract class DomainError extends Error {
  public readonly code: string
  public readonly statusCode: number

  constructor(message: string, code: string, statusCode: number = 400) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * Converts the error to a plain object for serialization
   */
  public toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
    }
  }
}

/**
 * Common domain errors
 */
export class EntityNotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`, 'ENTITY_NOT_FOUND', 404)
  }
}

export class InvalidEntityError extends DomainError {
  constructor(entity: string, reason: string) {
    super(`Invalid ${entity}: ${reason}`, 'INVALID_ENTITY', 400)
  }
}

export class BusinessRuleViolationError extends DomainError {
  constructor(rule: string, details?: string) {
    const message = details
      ? `Business rule violated: ${rule}. ${details}`
      : `Business rule violated: ${rule}`
    super(message, 'BUSINESS_RULE_VIOLATION', 422)
  }
}

export class ConcurrencyError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} was modified by another process`, 'CONCURRENCY_ERROR', 409)
  }
}

export class AuthorizationError extends DomainError {
  constructor(action: string, resource?: string) {
    const message = resource
      ? `Not authorized to ${action} on ${resource}`
      : `Not authorized to ${action}`
    super(message, 'AUTHORIZATION_ERROR', 403)
  }
}

export class ValidationError extends DomainError {
  constructor(field: string, _value: any, constraint: string) {
    super(`Validation failed for ${field}: ${constraint}`, 'VALIDATION_ERROR', 400)
  }
}

/**
 * Aggregate of multiple validation errors
 */
export class AggregateValidationError extends DomainError {
  public readonly errors: ValidationError[]

  constructor(errors: ValidationError[]) {
    const message = `Multiple validation errors: ${errors.map((e) => e.message).join('; ')}`
    super(message, 'AGGREGATE_VALIDATION_ERROR', 400)
    this.errors = errors
  }

  public override toJSON(): object {
    return {
      ...super.toJSON(),
      errors: this.errors.map((e) => e.toJSON()),
    }
  }
}
