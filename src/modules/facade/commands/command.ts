/**
 * Command (S5.1, ADR-0012): one business operation packed as an object. The facade (client)
 * builds a concrete command bound to its receiver and the call arguments, and hands it to the
 * `CommandInvoker`, which only knows this interface.
 */
export interface Command<Result> {
  execute(): Promise<Result>;
}
