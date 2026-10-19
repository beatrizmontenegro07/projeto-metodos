import type { Patient, PatientData, PatientStatusFilter } from "./patient";

/** What the business layer hands to storage for a new patient: validated data and its author. */
export type NewPatientRecord = PatientData & { createdBy: number };

/** Search already normalized by the business layer: a name search key or CPF digits, never both. */
export type PatientCriteria = {
  status: PatientStatusFilter;
  nameContains?: string;
  cpfContains?: string;
};

/**
 * Storage port for patients. The business layer depends only on this interface; each storage
 * mechanism (RAM collection, SQLite) implements it in `src/infra/patients`.
 *
 * Implementations must create patients active, reject a CPF that belongs to another patient
 * with `DuplicatePatientError`, throw `PatientNotFoundError` when updating an unknown id,
 * list in alphabetical order of `toSearchKey(name)` (then id), and wrap storage failures in
 * `PatientPersistenceError`.
 */
export interface PatientRepository {
  add(record: NewPatientRecord): Promise<Patient>;
  update(id: number, data: PatientData): Promise<Patient>;
  setActive(id: number, active: boolean): Promise<Patient>;
  findById(id: number): Promise<Patient | undefined>;
  list(criteria: PatientCriteria): Promise<Patient[]>;
  count(): Promise<number>;
}
