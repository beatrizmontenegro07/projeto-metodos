import { beforeEach, describe, expect, it } from "vitest";

import { createDatabase, IN_MEMORY_DATABASE_URL } from "@/db";
import { users } from "@/db/schema";
import { DuplicatePatientError, PatientNotFoundError } from "@/modules/patients/errors";
import type { PatientData } from "@/modules/patients/patient";
import type { NewPatientRecord, PatientRepository } from "@/modules/patients/patient-repository";

import { InMemoryPatientRepository } from "./in-memory-patient-repository";
import { SqlitePatientRepository } from "./sqlite-patient-repository";

const AUTHOR_ID = 1;

async function createSqliteRepositoryWithAuthor(): Promise<PatientRepository> {
  const database = await createDatabase(IN_MEMORY_DATABASE_URL);
  await database.insert(users).values({
    name: "Ana Silva",
    email: "ana@clinicore.com",
    login: "ana",
    passwordHash: "salt:key",
    role: "RECEPTIONIST",
  });
  return new SqlitePatientRepository(database);
}

// Both mechanisms must behave the same, so the controller can use either one.
const implementations: [name: string, create: () => Promise<PatientRepository>][] = [
  ["InMemoryPatientRepository", async () => new InMemoryPatientRepository()],
  ["SqlitePatientRepository", createSqliteRepositoryWithAuthor],
];

function data(overrides: Partial<PatientData> = {}): PatientData {
  return {
    name: "Joana Souza Lima",
    cpf: "12345678909",
    birthDate: "1985-03-12",
    gender: "FEMALE",
    phone: "83987654321",
    legalBasis: "HEALTH_PROTECTION",
    ...overrides,
  };
}

function record(overrides: Partial<PatientData> = {}): NewPatientRecord {
  return { ...data(overrides), createdBy: AUTHOR_ID };
}

const JOANA = { id: 1, active: true, ...record() };

describe.each(implementations)("%s", (_name, createRepository) => {
  let repository: PatientRepository;

  beforeEach(async () => {
    repository = await createRepository();
  });

  it("adds an active patient with a unique identifier", async () => {
    expect(await repository.add(record())).toEqual(JOANA);
    expect(await repository.findById(1)).toEqual(JOANA);
  });

  it("keeps the optional e-mail and address", async () => {
    const patient = await repository.add(record({ email: "joana@mail.com", address: "Rua das Flores, 100" }));

    expect(await repository.findById(patient.id)).toMatchObject({
      email: "joana@mail.com",
      address: "Rua das Flores, 100",
    });
  });

  it("rejects a repeated CPF without adding a second patient", async () => {
    await repository.add(record());

    await expect(repository.add(record({ name: "Other Person" }))).rejects.toBeInstanceOf(DuplicatePatientError);
    expect(await repository.count()).toBe(1);
  });

  it("rejects a repeated CPF added concurrently without adding a second patient", async () => {
    const results = await Promise.allSettled([repository.add(record()), repository.add(record({ name: "Other" }))]);

    expect(results.filter((result) => result.status === "rejected")).toEqual([
      { status: "rejected", reason: expect.any(DuplicatePatientError) },
    ]);
    expect(await repository.count()).toBe(1);
  });

  it("replaces the data, clears blanked optional fields and keeps status and author", async () => {
    await repository.add(record({ email: "joana@mail.com" }));
    await repository.setActive(1, false);
    const updated = await repository.update(1, data({ phone: "8332221100" }));

    expect(updated).toEqual({ ...JOANA, phone: "8332221100", active: false });
    expect(await repository.findById(1)).toEqual(updated);
  });

  it("rejects an update to the CPF of another patient", async () => {
    await repository.add(record());
    await repository.add(record({ name: "Bruno Lima", cpf: "52998224725" }));
    await expect(repository.update(2, data({ name: "Bruno Lima" }))).rejects.toBeInstanceOf(DuplicatePatientError);
    expect(await repository.findById(2)).toMatchObject({ cpf: "52998224725" });
  });

  it("reports an unknown patient", async () => {
    await expect(repository.update(99, data())).rejects.toBeInstanceOf(PatientNotFoundError);
    await expect(repository.setActive(99, false)).rejects.toBeInstanceOf(PatientNotFoundError);
    expect(await repository.findById(99)).toBeUndefined();
  });

  describe("listing", () => {
    beforeEach(async () => {
      await repository.add(record({ name: "Bruno Lima", cpf: "52998224725" }));
      await repository.add(record({ name: "Álvaro Dias", cpf: "12345678909" }));
      await repository.add(record({ name: "carla 100% Souza", cpf: "98765432100" }));
      await repository.setActive(1, false);
    });

    async function names(criteria: Parameters<PatientRepository["list"]>[0]) {
      return (await repository.list(criteria)).map((patient) => patient.name);
    }

    it("orders by name ignoring accents and letter case", async () => {
      expect(await names({ status: "all" })).toEqual(["Álvaro Dias", "Bruno Lima", "carla 100% Souza"]);
    });

    it("filters by status", async () => {
      expect(await names({ status: "inactive" })).toEqual(["Bruno Lima"]);
      expect(await names({ status: "active" })).toEqual(["Álvaro Dias", "carla 100% Souza"]);
    });

    it("finds part of the name search key", async () => {
      expect(await names({ status: "all", nameContains: "alvaro" })).toEqual(["Álvaro Dias"]);
    });

    it("treats search wildcards as plain characters", async () => {
      expect(await names({ status: "all", nameContains: "100%" })).toEqual(["carla 100% Souza"]);
      expect(await names({ status: "all", nameContains: "_" })).toEqual([]);
    });

    it("finds part of the CPF", async () => {
      expect(await names({ status: "all", cpfContains: "456789" })).toEqual(["Álvaro Dias"]);
    });

    it("combines search and status", async () => {
      expect(await names({ status: "active", nameContains: "bruno" })).toEqual([]);
    });

    it("counts every patient, active or not", async () => {
      expect(await repository.count()).toBe(3);
    });
  });

  it("does not let returned values change the stored patient", async () => {
    const added = await repository.add(record());
    added.name = "Changed";
    const [listed] = await repository.list({ status: "all" });
    listed.active = false;

    expect(await repository.findById(1)).toEqual(JOANA);
  });
});

describe("InMemoryPatientRepository", () => {
  it("keeps patients only while the process runs: a new repository starts empty", async () => {
    await new InMemoryPatientRepository().add(record());

    expect(await new InMemoryPatientRepository().count()).toBe(0);
  });
});
