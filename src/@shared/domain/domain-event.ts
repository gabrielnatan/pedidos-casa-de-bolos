export interface DomainEvent {
  readonly aggregateId: string;
  readonly occurredAt: Date;
  readonly eventName: string;
}

export abstract class BaseDomainEvent implements DomainEvent {
  public readonly aggregateId: string;
  public readonly occurredAt: Date;

  protected constructor(aggregateId: string, occurredAt?: Date) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt ?? new Date();
  }

  public abstract get eventName(): string;
}
