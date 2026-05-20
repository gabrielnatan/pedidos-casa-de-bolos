import { Entity } from "@shared/domain/entity.js";
import type { DomainEvent } from "@shared/domain/domain-event.js";

export abstract class AggregateRoot extends Entity {
  private readonly _domainEvents: DomainEvent[] = [];

  public get domainEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents;
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public clearDomainEvents(): void {
    this._domainEvents.length = 0;
  }

  public pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this.clearDomainEvents();
    return events;
  }
}
