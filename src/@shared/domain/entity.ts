import { randomUUID } from "node:crypto";

export abstract class Entity {
  public readonly id: string;

  protected constructor(id?: string) {
    this.id = id ?? randomUUID();
  }

  public equals(other?: Entity): boolean {
    if (!other) return false;
    if (other === this) return true;
    if (other.constructor !== this.constructor) return false;
    return other.id === this.id;
  }
}
