import { getDatabase } from "@/db";
import type { Repositories } from "@/modules/facade/repositories";
import type { PatientRepository } from "@/modules/patients/patient-repository";
import type { UserRepository } from "@/modules/users/user-repository";

import { InMemoryRepositoryFactory } from "./in-memory-repository-factory";
import { SqliteRepositoryFactory } from "./sqlite-repository-factory";
import { readStorageMechanism, type StorageMechanism } from "./storage-mechanism";

/** Abstract Factory: creates one compatible family of persistence implementations. */
export interface RepositoryFactory {
  createUserRepository(): UserRepository;
  createPatientRepository(): PatientRepository;
}

export async function createRepositoryFactory(mechanism: StorageMechanism): Promise<RepositoryFactory> {
  if (mechanism === "memory") return new InMemoryRepositoryFactory();
  return new SqliteRepositoryFactory(await getDatabase());
}

async function createRepositories(): Promise<Repositories> {
  const factory = await createRepositoryFactory(readStorageMechanism(process.env.STORAGE));
  return { users: factory.createUserRepository(), patients: factory.createPatientRepository() };
}

const globalScope = globalThis as typeof globalThis & {
  applicationRepositories?: Promise<Repositories>;
};

/** Select once per process; preserve both RAM collections through development hot reloads. */
export function getRepositories(): Promise<Repositories> {
  globalScope.applicationRepositories ??= createRepositories();
  return globalScope.applicationRepositories;
}
