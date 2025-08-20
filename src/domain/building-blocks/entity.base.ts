import { ulid } from 'ulid'

import { Result } from './result'

export abstract class Entity<T> {
  protected readonly _id: string
  protected props: T

  constructor(props: T, id?: string) {
    const guardResult = this.validate(props)
    if (guardResult.isFailure) {
      throw new Error(guardResult.error)
    }

    this._id = id ?? ulid()
    this.props = props
  }

  /**
   * Abstract validation method that must be implemented by concrete entities
   * This ensures all entities have proper validation
   */
  protected abstract validate(props: T): Result<void>

  /**
   * Compares entities by their identity (ID)
   * Two entities are equal if they have the same ID
   */
  public equals(object?: Entity<T>): boolean {
    if (object === null || object === undefined) {
      return false
    }

    if (this === object) {
      return true
    }

    if (!(object instanceof Entity)) {
      return false
    }

    return this._id === object._id
  }

  /**
   * Returns the entity's unique identifier
   */
  get id(): string {
    return this._id
  }

  /**
   * Updates entity properties with validation
   */
  protected update(props: Partial<T>): Result<void> {
    const newProps = { ...this.props, ...props }
    const validationResult = this.validate(newProps)

    if (validationResult.isFailure) {
      return validationResult
    }

    this.props = newProps
    return Result.ok()
  }
}
