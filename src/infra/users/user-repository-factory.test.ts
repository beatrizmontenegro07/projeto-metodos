import { afterEach, describe, expect, it, vi } from "vitest";

import { IN_MEMORY_DATABASE_URL } from "@/db";

import { InMemoryUserRepository } from "./in-memory-user-repository";
import { SqliteUserRepository } from "./sqlite-user-repository";
import { createUserRepository } from "./user-repository-factory";

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
});
