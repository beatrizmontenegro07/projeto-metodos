import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { applyMigrations, createDatabase } from "@/db";
import { patients, users } from "@/db/schema";
import { PatientPersistenceError } from "@/modules/patients/errors";
import type { NewPatientRecord } from "@/modules/patients/patient-repository";

import { SqlitePatientRepository } from "./sqlite-patient-repository";

const JOANA: NewPatientRecord = {
  name: "Joana Souza Lima",
  cpf: "12345678909",
  birthDate: "1985-03-12",
  gender: "FEMALE",
  phone: "83987654321",
  legalBasis: "HEALTH_PROTECTION",
  createdBy: 1,
};

describe("SqlitePatientRepository", () => {
  let temporaryFolder: string;

  beforeEach(() => {
    temporaryFolder = mkdtempSync(join(tmpdir(), "clinicore-"));
  });

  afterEach(() => {
    rmSync(temporaryFolder, { recursive: true, force: true });
  });

  async function createMigratedDatabase(url: string) {
    const database = await createDatabase(url);
    await applyMigrations(database);
    await database
      .insert(users)
      .values({ name: "Ana Silva", email: "ana@clinicore.com", login: "ana", passwordHash: "salt:key", role: "ADMIN" });
    return database;
  }

  it("persists patients across runs when the database is a SQLite file", async () => {
    const url = `file:${join(temporaryFolder, "clinicore.db")}`;
    const firstRun = await createMigratedDatabase(url);
    await new SqlitePatientRepository(firstRun).add(JOANA);
    firstRun.$client.close();

    const secondRun = new SqlitePatientRepository(await createDatabase(url));

    expect(await secondRun.count()).toBe(1);
  });

  it("stores the name search key without accents", async () => {
    const database = await createMigratedDatabase(`file:${join(temporaryFolder, "clinicore.db")}`);

    await new SqlitePatientRepository(database).add({ ...JOANA, name: "João Pereira" });
    const [row] = await database.select().from(patients);

    expect(row.searchName).toBe("joao pereira");
  });

  it("turns database failures into a persistence error", async () => {
    const databaseWithoutTables = await createDatabase(`file:${join(temporaryFolder, "empty.db")}`);
    const repository = new SqlitePatientRepository(databaseWithoutTables);

    await expect(repository.list({ status: "all" })).rejects.toBeInstanceOf(PatientPersistenceError);
    await expect(repository.add(JOANA)).rejects.toBeInstanceOf(PatientPersistenceError);
    await expect(repository.count()).rejects.toBeInstanceOf(PatientPersistenceError);
  });
});
