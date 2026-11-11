import type { Database } from "@/db";

import { SqliteAccessRecordRepository } from "./access-records/sqlite-access-record-repository";
import { SqlitePatientRepository } from "./patients/sqlite-patient-repository";
import type { RepositoryFactory } from "./repository-factory";
import { SqliteUserRepository } from "./users/sqlite-user-repository";

/** Concrete factory whose products share the same SQLite connection. */
export class SqliteRepositoryFactory implements RepositoryFactory {
  constructor(private readonly database: Database) {}

  createAccessRecordRepository(): SqliteAccessRecordRepository {
    return new SqliteAccessRecordRepository(this.database);
  }

  createUserRepository(): SqliteUserRepository {
    return new SqliteUserRepository(this.database);
  }

  createPatientRepository(): SqlitePatientRepository {
    return new SqlitePatientRepository(this.database);
  }
}
