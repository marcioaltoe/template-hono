import type { AggregateRoot } from '../building-blocks/aggregate-root.base'
import type { Result } from '../building-blocks/result'
import type { Specification } from '../building-blocks/specification.base'

/**
 * Base repository interface for aggregate roots
 * Defines the contract for data access in the domain layer
 */
export interface Repository<T extends AggregateRoot<any>> {
  /**
   * Checks if an entity exists by ID
   */
  exists(id: string): Promise<boolean>

  /**
   * Retrieves an entity by ID
   */
  findById(id: string): Promise<Result<T>>

  /**
   * Retrieves all entities
   */
  findAll(): Promise<Result<T[]>>

  /**
   * Saves an entity (create or update)
   */
  save(entity: T): Promise<Result<void>>

  /**
   * Deletes an entity
   */
  delete(entity: T): Promise<Result<void>>

  /**
   * Deletes an entity by ID
   */
  deleteById(id: string): Promise<Result<void>>
}

/**
 * Extended repository interface with additional query capabilities
 */
export interface ExtendedRepository<T extends AggregateRoot<any>> extends Repository<T> {
  /**
   * Finds entities matching a specification
   */
  findBySpecification(spec: Specification<T>): Promise<Result<T[]>>

  /**
   * Counts entities
   */
  count(): Promise<Result<number>>

  /**
   * Counts entities matching a specification
   */
  countBySpecification(spec: Specification<T>): Promise<Result<number>>

  /**
   * Finds entities with pagination
   */
  findWithPagination(params: PaginationParams): Promise<Result<PaginatedResult<T>>>

  /**
   * Bulk operations
   */
  saveMany(entities: T[]): Promise<Result<void>>
  deleteMany(ids: string[]): Promise<Result<void>>
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

/**
 * Unit of Work pattern interface
 * Manages transactions and tracks changes to aggregates
 */
export interface UnitOfWork {
  /**
   * Begins a new transaction
   */
  begin(): Promise<void>

  /**
   * Commits the current transaction
   */
  commit(): Promise<void>

  /**
   * Rolls back the current transaction
   */
  rollback(): Promise<void>

  /**
   * Registers an aggregate as new (to be inserted)
   */
  registerNew<T extends AggregateRoot<any>>(entity: T): void

  /**
   * Registers an aggregate as modified (to be updated)
   */
  registerModified<T extends AggregateRoot<any>>(entity: T): void

  /**
   * Registers an aggregate as deleted (to be removed)
   */
  registerDeleted<T extends AggregateRoot<any>>(entity: T): void

  /**
   * Gets a repository for the specified aggregate type
   */
  getRepository<T extends AggregateRoot<any>>(aggregateType: string): Repository<T>

  /**
   * Executes a function within a transaction
   */
  execute<T>(fn: () => Promise<T>): Promise<T>
}

/**
 * Factory for creating Unit of Work instances
 */
export interface UnitOfWorkFactory {
  create(): UnitOfWork
}
