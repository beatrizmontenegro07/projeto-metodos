import { getDatabase } from "@/db";
import { readStorageMechanism, type StorageMechanism } from "@/infra/storage-mechanism";
import type { PatientRepository } from "@/modules/patients/patient-repository";

import { InMemoryPatientRepository } from "./in-memory-patient-repository";
import { SqlitePatientRepository } from "./sqlite-patient-repository";

export async function createPatientRepository(mechanism: StorageMechanism): Promise<PatientRepository> {
  if (mechanism === "memory") return new InMemoryPatientRepository();
  return new SqlitePatientRepository(await getDatabase());
}

const globalScope = globalThis as typeof globalThis & {
  applicationPatientRepository?: Promise<PatientRepository>;
};

/**
 * The process-wide repository, built once from the STORAGE variable at startup. It lives on
 * globalThis so `next dev` hot reloads do not drop the patients kept in the RAM collection.
 */
export function getPatientRepository(): Promise<PatientRepository> {
  globalScope.applicationPatientRepository ??= createPatientRepository(readStorageMechanism(process.env.STORAGE));
  return globalScope.applicationPatientRepository;
}
