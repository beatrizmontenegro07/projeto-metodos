import { describe, expect, it, vi } from "vitest";

import type { Command } from "./command";
import { CommandInvoker } from "./command-invoker";

describe("the command invoker (Command)", () => {
  it("runs the command and returns its result", async () => {
    const command: Command<number> = { execute: vi.fn(async () => 42) };

    expect(await new CommandInvoker().execute(command)).toBe(42);
    expect(command.execute).toHaveBeenCalledOnce();
  });

  it("lets the command's error reach the caller", async () => {
    const failure = new Error("receiver failed");
    const command: Command<never> = { execute: () => Promise.reject(failure) };

    await expect(new CommandInvoker().execute(command)).rejects.toBe(failure);
  });
});
