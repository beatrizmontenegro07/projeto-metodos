import { and, asc, count, eq, type SQL, sql } from "drizzle-orm";

import type { Database } from "@/db";
import { findUniqueConstraintColumn } from "@/db/errors";
import { patients } from "@/db/schema";
import { DuplicatePatientError, PatientNotFoundError, PatientPersistenceError } from "@/modules/patients/errors";
import type { Patient, PatientData, PatientStatusFilter } from "@/modules/patients/patient";
import type { NewPatientRecord, PatientCriteria, PatientRepository } from "@/modules/patients/patient-repository";
import { toSearchKey } from "@/modules/patients/rules";

type PatientRow = typeof patients.$inferSelect;

const STATUS_CONDITIONS: Record<PatientStatusFilter, SQL | undefined> = {
  all: undefined,
  active: eq(patients.active, true),
  inactive: eq(patients.active, false),
};

/** Permanent mechanism: patients live in the `patients` table of a SQLite database (local file or Turso). */
export class SqlitePatientRepository implements PatientRepository {
  constructor(private readonly database: Database) {}

  async add(record: NewPatientRecord): Promise<Patient> {
    // The unique index on cpf is the only duplicate check, so two concurrent
    // registrations cannot both pass it (see accessStorage).
    const [row] = await this.accessStorage(() =>
      this.database.insert(patients).values(toColumns(record)).returning(),
    );
    return toPatient(row);
  }

  async update(id: number, data: PatientData): Promise<Patient> {
    const rows = await this.accessStorage(() =>
      this.database.update(patients).set(toColumns(data)).where(eq(patients.id, id)).returning(),
    );
    return toFoundPatient(id, rows);
  }

  async setActive(id: number, active: boolean): Promise<Patient> {
    const rows = await this.accessStorage(() =>
      this.database.update(patients).set({ active }).where(eq(patients.id, id)).returning(),
    );
    return toFoundPatient(id, rows);
  }

  async findById(id: number): Promise<Patient | undefined> {
    const [row] = await this.accessStorage(() => this.database.select().from(patients).where(eq(patients.id, id)));
    return row && toPatient(row);
  }

  async list({ status, nameContains, cpfContains }: PatientCriteria): Promise<Patient[]> {
    // instr() instead of LIKE, so "%" or "_" typed in a search are plain characters.
    const conditions = and(
      STATUS_CONDITIONS[status],
      nameContains === undefined ? undefined : sql`instr(${patients.searchName}, ${nameContains}) > 0`,
      cpfContains === undefined ? undefined : sql`instr(${patients.cpf}, ${cpfContains}) > 0`,
    );
    const rows = await this.accessStorage(() =>
      this.database.select().from(patients).where(conditions).orderBy(asc(patients.searchName), asc(patients.id)),
    );
    return rows.map(toPatient);
  }

  async count(): Promise<number> {
    const [{ total }] = await this.accessStorage(() => this.database.select({ total: count() }).from(patients));
    return total;
  }

  /** Runs a database operation and turns its failures into patient domain errors. */
  private async accessStorage<T>(operation: () => PromiseLike<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (findUniqueConstraintColumn(error) === "cpf") throw new DuplicatePatientError();
      throw new PatientPersistenceError("Could not access patient storage.", { cause: error });
    }
  }
}

/** Optional fields are written as NULL, so an edit that blanks the e-mail or address clears it. */
function toColumns<Data extends PatientData>(data: Data) {
  return { ...data, searchName: toSearchKey(data.name), email: data.email ?? null, address: data.address ?? null };
}

function toFoundPatient(id: number, rows: PatientRow[]): Patient {
  if (rows.length === 0) throw new PatientNotFoundError(id);
  return toPatient(rows[0]);
}

function toPatient(row: PatientRow): Patient {
  const { id, name, cpf, birthDate, gender, phone, email, address, legalBasis, active, createdBy } = row;
  return {
    id,
    name,
    cpf,
    birthDate,
    gender,
    phone,
    ...(email === null ? {} : { email }),
    ...(address === null ? {} : { address }),
    legalBasis,
    active,
    createdBy,
  };
}
