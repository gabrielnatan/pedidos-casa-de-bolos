export abstract class ValueObject<T> {
  protected readonly value: T;

  constructor(value: T) {
    this.value = value;
    Object.freeze(this);
  }

  getValue(): T {
    return this.value;
  }

  toString(): string {
    return String(this.value);
  }

  equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) return false;
    if (vo.constructor !== this.constructor) return false;
    return JSON.stringify(this.value) === JSON.stringify(vo.value);
  }
}
