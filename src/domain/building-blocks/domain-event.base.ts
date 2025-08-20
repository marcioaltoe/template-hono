import { ulid } from 'ulid'

/**
 * Base interface for all domain events
 * Domain events represent something that has happened in the domain
 */
export interface DomainEvent {
  readonly aggregateId: string
  readonly eventId: string
  readonly occurredOn: Date
  readonly eventVersion: number
  readonly eventName: string
  readonly metadata?: EventMetadata
}

/**
 * Metadata that can be attached to domain events
 */
export interface EventMetadata {
  readonly correlationId?: string
  readonly causationId?: string
  readonly userId?: string
  readonly ipAddress?: string
  readonly userAgent?: string
  [key: string]: any
}

/**
 * Base class for domain events with common functionality
 */
export abstract class DomainEventBase implements DomainEvent {
  public readonly eventId: string
  public readonly occurredOn: Date
  public readonly eventVersion: number = 1

  constructor(
    public readonly aggregateId: string,
    public readonly eventName: string,
    public readonly metadata?: EventMetadata,
  ) {
    this.eventId = ulid()
    this.occurredOn = new Date()
  }

  /**
   * Serializes the event to JSON
   */
  public toJSON(): object {
    return {
      eventId: this.eventId,
      eventName: this.eventName,
      aggregateId: this.aggregateId,
      occurredOn: this.occurredOn.toISOString(),
      eventVersion: this.eventVersion,
      metadata: this.metadata,
      payload: this.getEventPayload(),
    }
  }

  /**
   * Gets the event-specific payload
   * Must be implemented by concrete event classes
   */
  protected abstract getEventPayload(): object
}

/**
 * Interface for domain event handlers
 */
export interface DomainEventHandler<T extends DomainEvent = DomainEvent> {
  /**
   * Handles a domain event
   */
  handle(event: T): Promise<void> | void

  /**
   * Returns the event names this handler subscribes to
   */
  subscribedTo(): string[]
}

/**
 * Domain event publisher interface
 */
export interface DomainEventPublisher {
  /**
   * Publishes a domain event
   */
  publish(event: DomainEvent): Promise<void>

  /**
   * Publishes multiple domain events
   */
  publishAll(events: DomainEvent[]): Promise<void>

  /**
   * Subscribes a handler to domain events
   */
  subscribe(handler: DomainEventHandler): void

  /**
   * Unsubscribes a handler from domain events
   */
  unsubscribe(handler: DomainEventHandler): void
}
