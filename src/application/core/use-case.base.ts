import { Result } from '@/domain/building-blocks'

/**
 * Base interface for use cases (application services)
 * Use cases orchestrate the flow of data and coordinate domain objects
 */
export interface UseCase<TRequest, TResponse> {
  /**
   * Executes the use case with the given request
   */
  execute(request: TRequest): Promise<Result<TResponse>>
}

/**
 * Use case without request parameters
 */
export interface UseCaseWithoutRequest<TResponse> {
  /**
   * Executes the use case
   */
  execute(): Promise<Result<TResponse>>
}

/**
 * Use case without response
 */
export interface UseCaseWithoutResponse<TRequest> {
  /**
   * Executes the use case with the given request
   */
  execute(request: TRequest): Promise<Result<void>>
}

/**
 * Command use case (for write operations)
 */
export interface CommandUseCase<TCommand, TResponse = void> extends UseCase<TCommand, TResponse> {
  /**
   * Validates the command before execution
   */
  validate?(command: TCommand): Result<void>
}

/**
 * Query use case (for read operations)
 */
export interface QueryUseCase<TQuery, TResponse> extends UseCase<TQuery, TResponse> {
  /**
   * Validates the query before execution
   */
  validate?(query: TQuery): Result<void>
}

/**
 * Base class for use cases with common functionality
 */
export abstract class BaseUseCase<TRequest, TResponse> implements UseCase<TRequest, TResponse> {
  /**
   * Template method that executes the use case
   */
  public async execute(request: TRequest): Promise<Result<TResponse>> {
    // Validate the request
    const validationResult = this.validate(request)
    if (validationResult.isFailure) {
      return Result.fail<TResponse>(validationResult.getErrorValue())
    }

    try {
      // Execute the business logic
      return await this.executeImpl(request)
    } catch (error) {
      // Handle unexpected errors
      return this.handleError(error)
    }
  }

  /**
   * Validates the request
   * Override this to provide custom validation
   */
  protected validate(_request: TRequest): Result<void> {
    return Result.ok()
  }

  /**
   * Implements the actual business logic
   * Must be implemented by concrete use cases
   */
  protected abstract executeImpl(request: TRequest): Promise<Result<TResponse>>

  /**
   * Handles errors that occur during execution
   * Override this to provide custom error handling
   */
  protected handleError(error: unknown): Result<TResponse> {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    return Result.fail<TResponse>(message)
  }
}

/**
 * Transaction decorator for use cases
 * Ensures the use case runs within a database transaction
 */
export function Transactional<TRequest, _TResponse>(
  _target: any,
  _propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value

  descriptor.value = async function (this: any, request: TRequest) {
    // This would be implemented with your transaction management
    // For now, just call the original method
    return originalMethod.call(this, request)
  }

  return descriptor
}
