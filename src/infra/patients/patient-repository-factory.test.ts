import { afterEach, describe, expect, it, vi } from "vitest";

import { IN_MEMORY_DATABASE_URL } from "@/db";

import { InMemoryPatientRepository } from "./in-memory-patient-repository";
import { createPatientRepository } from "./patient-repository-factory";
import { SqlitePatientRepository } from "./sqlite-patient-repository";

describe("choosing the patient storage mechanism at startup", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("creates the RAM collection when STORAGE is memory", async () => {
    expect(await createPatientRepository("memory")).toBeInstanceOf(InMemoryPatientRepository);
  });

  it("creates the SQLite repository when STORAGE is sqlite", async () => {
    vi.stubEnv("DATABASE_URL", IN_MEMORY_DATABASE_URL);

    expect(await createPatientRepository("sqlite")).toBeInstanceOf(SqlitePatientRepository);
  });
});
