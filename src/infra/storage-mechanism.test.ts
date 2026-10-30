import { describe, expect, it } from "vitest";

import { readStorageMechanism } from "./storage-mechanism";

describe("reading the storage mechanism at startup", () => {
  it.each(["memory", "sqlite"])("accepts STORAGE=%s", (value) => {
    expect(readStorageMechanism(value)).toBe(value);
  });

  it.each([undefined, "", "file", "MEMORY"])("rejects STORAGE=%s with a clear message", (value) => {
    expect(() => readStorageMechanism(value)).toThrow("STORAGE must be one of: memory, sqlite.");
  });
});
