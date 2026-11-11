import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as database from "@/db";
import type { Repositories } from "@/modules/facade/repositories";

import { InMemoryAccessRecordRepository } from "./access-records/in-memory-access-record-repository";
import { SqliteAccessRecordRepository } from "./access-records/sqlite-access-record-repository";
import { InMemoryRepositoryFactory } from "./in-memory-repository-factory";
import { InMemoryPatientRepository } from "./patients/in-memory-patient-repository";
import { SqlitePatientRepository } from "./patients/sqlite-patient-repository";
import { createRepositoryFactory, getRepositories } from "./repository-factory";
import { SqliteRepositoryFactory } from "./sqlite-repository-factory";
import { InMemoryUserRepository } from "./users/in-memory-user-repository";
import { SqliteUserRepository } from "./users/sqlite-user-repository";

const globalScope = globalThis as typeof globalThis & { applicationRepositories?: Promise<Repositories> };

describe("repository abstract factory", () => {
  beforeEach(() => {
    delete globalScope.applicationRepositories;
  });

  afterEach(() => {
    delete globalScope.applicationRepositories;
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("creates the whole RAM family without opening a database", async () => {
    const connect = vi.spyOn(database, "getDatabase");
    vi.stubEnv("DATABASE_URL", "");
    const factory = await createRepositoryFactory("memory");

    expect(factory).toBeInstanceOf(InMemoryRepositoryFactory);
    expect(factory.createUserRepository()).toBeInstanceOf(InMemoryUserRepository);
    expect(factory.createPatientRepository()).toBeInstanceOf(InMemoryPatientRepository);
    expect(factory.createAccessRecordRepository()).toBeInstanceOf(InMemoryAccessRecordRepository);
    expect(connect).not.toHaveBeenCalled();
  });

  it("creates the whole SQLite family on one connection and preserves the patient author", async () => {
    const connection = await database.createDatabase(database.IN_MEMORY_DATABASE_URL);
    const connect = vi.spyOn(database, "getDatabase").mockResolvedValue(connection);
    const factory = await createRepositoryFactory("sqlite");
    const users = factory.createUserRepository();
    const patients = factory.createPatientRepository();

    expect(factory).toBeInstanceOf(SqliteRepositoryFactory);
    expect(users).toBeInstanceOf(SqliteUserRepository);
    expect(patients).toBeInstanceOf(SqlitePatientRepository);
    const author = await users.add({ name: "Ana", email: "ana@example.com", login: "ana", passwordHash: "hash", role: "ADMIN" });
    const patient = await patients.add({ name: "Joana", cpf: "12345678909", birthDate: "1985-03-12", gender: "FEMALE", phone: "83987654321", legalBasis: "HEALTH_PROTECTION", createdBy: author.id });

    expect((await patients.findById(patient.id))?.createdBy).toBe(author.id);
    const accesses = factory.createAccessRecordRepository();
    expect(accesses).toBeInstanceOf(SqliteAccessRecordRepository);
    await accesses.add({ userId: author.id, occurredAt: "2026-11-11T12:00:00.000Z" });
    expect(await accesses.list()).toHaveLength(1);
    expect(connect).toHaveBeenCalledTimes(1);
  });

  it("shares one repository family across concurrent calls and later environment changes", async () => {
    vi.stubEnv("STORAGE", "memory");
    const first = getRepositories();
    const concurrent = getRepositories();
    vi.stubEnv("STORAGE", "sqlite");
    const later = getRepositories();

    expect(concurrent).toBe(first);
    expect(later).toBe(first);
    const repositories = await first;
    expect(repositories.users).toBeInstanceOf(InMemoryUserRepository);
    expect(repositories.patients).toBeInstanceOf(InMemoryPatientRepository);
    expect(repositories.accesses).toBeInstanceOf(InMemoryAccessRecordRepository);
    await repositories.users.add({ name: "Ana", email: "ana@example.com", login: "ana", passwordHash: "hash", role: "ADMIN" });
    expect(await (await later).users.count()).toBe(1);
  });

  it.each(["", "postgres"])("rejects invalid storage %s before connecting", async (value) => {
    vi.stubEnv("STORAGE", value);
    const connect = vi.spyOn(database, "getDatabase");

    await expect(getRepositories()).rejects.toThrow("STORAGE must be one of: memory, sqlite");
    expect(connect).not.toHaveBeenCalled();
  });
});
