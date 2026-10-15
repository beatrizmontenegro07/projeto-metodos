import { afterEach, describe, expect, it, vi } from "vitest";

import { IN_MEMORY_DATABASE_URL } from "@/db";

import { InMemoryUserRepository } from "./in-memory-user-repository";
import { SqliteUserRepository } from "./sqlite-user-repository";
import { createUserRepository, readStorageMechanism } from "./user-repository-factory";

describe("choosing the storage mechanism at startup", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("creates the RAM collection when STORAGE is memory", async () => {
    expect(await createUserRepository("memory")).toBeInstanceOf(InMemoryUserRepository);
  });

  it("creates the SQLite repository when STORAGE is sqlite", async () => {
    vi.stubEnv("DATABASE_URL", IN_MEMORY_DATABASE_URL);

    expect(await createUserRepository("sqlite")).toBeInstanceOf(SqliteUserRepository);
  });

  it.each(["memory", "sqlite"])("accepts STORAGE=%s", (value) => {
    expect(readStorageMechanism(value)).toBe(value);
  });

  it.each([undefined, "", "file", "MEMORY"])("rejects STORAGE=%s with a clear message", (value) => {
    expect(() => readStorageMechanism(value)).toThrow("STORAGE must be one of: memory, sqlite.");
  });
});
