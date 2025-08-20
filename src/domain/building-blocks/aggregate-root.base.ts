import type { DomainEvent } from './domain-event.base'

import { Entity } from './entity.base'

/**
 * AggregateRoot is the base class for all aggregate roots in the domain
 * It extends Entity and adds domain event management capabilities
 */
export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: DomainEvent[] = []
  private _version: number = 0

  /**
   * Returns all domain events that have been raised
   */
  get domainEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents
  }

  /**
   * Returns the current version of the aggregate
   * Used for optimistic concurrency control
   */
  get version(): number {
    return this._version
  }

  /**
   * Adds a domain event to the aggregate
   * Events are collected and can be dispatched later
   */
  protected addDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent)
    this.logDomainEventAdded(domainEvent)
  }

  /**
   * Removes a specific domain event
   */
  protected removeDomainEvent(domainEvent: DomainEvent): void {
    const index = this._domainEvents.indexOf(domainEvent)
    if (index > -1) {
      this._domainEvents.splice(index, 1)
    }
  }

  /**
   * Clears all domain events
   * Should be called after events have been dispatched
   */
  public clearEvents(): void {
    this._domainEvents = []
  }

  /**
   * Marks the aggregate as having been persisted
   * Increments version and clears events
   */
  public markAsCommitted(): void {
    this._version++
    this.clearEvents()
  }

  /**
   * Hook for logging when domain events are added
   * Can be overridden by subclasses for custom logging
   */
  protected logDomainEventAdded(_domainEvent: DomainEvent): void {
    // Default implementation does nothing
    // Subclasses can override for logging
  }

  /**
   * Checks if there are any uncommitted events
   */
  public hasUncommittedEvents(): boolean {
    return this._domainEvents.length > 0
  }

  /**
   * Gets uncommitted events without clearing them
   */
  public getUncommittedEvents(): ReadonlyArray<DomainEvent> {
    return [...this._domainEvents]
  }

  /**
   * Applies an event to the aggregate (for event sourcing)
   * Should be overridden by aggregates that support event sourcing
   */
  protected apply(_event: DomainEvent): void {
    // Default implementation does nothing
    // Override in event-sourced aggregates
  }

  /**
   * Replays events to rebuild aggregate state (for event sourcing)
   */
  public loadFromHistory(events: DomainEvent[]): void {
    for (const event of events) {
      this.apply(event)
      this._version++
    }
  }
}
