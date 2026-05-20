export interface Usecase<IN = void, OUT = void> {
  execute(input: IN): Promise<OUT>;
}
