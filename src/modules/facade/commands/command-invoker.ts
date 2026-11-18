import type { Command } from "./command";

/**
 * Invoker of the Command pattern: runs every operation of the facade. It depends only on
 * `Command`, so a new use case is a new concrete command, without changing the invoker.
 */
export class CommandInvoker {
  execute<Result>(command: Command<Result>): Promise<Result> {
    return command.execute();
  }
}
