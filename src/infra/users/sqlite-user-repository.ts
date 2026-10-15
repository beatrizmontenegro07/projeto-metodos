import { asc } from "drizzle-orm";

import type { Database } from "@/db";
import { findUniqueConstraintColumn } from "@/db/errors";
import { users } from "@/db/schema";
import { UserPersistenceError, UserValidationError, type UserValidationErrorCode } from "@/modules/users/errors";
import type { User } from "@/modules/users/user";
import type { NewUserRecord, UserRepository } from "@/modules/users/user-repository";

const PUBLIC_COLUMNS = {
  id: users.id,
  name: users.name,
  email: users.email,
  login: users.login,
  role: users.role,
};

const DUPLICATE_COLUMN_ERROR_CODES: Partial<Record<string, UserValidationErrorCode>> = {
  email: "EMAIL_ALREADY_REGISTERED",
  login: "LOGIN_ALREADY_REGISTERED",
};

/** Permanent mechanism: users live in the `users` table of a SQLite database (local file or Turso). */
export class SqliteUserRepository implements UserRepository {
  constructor(private readonly database: Database) {}

  async add(record: NewUserRecord): Promise<User> {
    // The unique indexes on e-mail and login are the only duplicate check, so two
    // concurrent registrations cannot both pass it (see accessStorage).
    const [user] = await this.accessStorage(() =>
      this.database.insert(users).values(record).returning(PUBLIC_COLUMNS),
    );
    return user;
  }

  list(): Promise<User[]> {
    return this.accessStorage(() => this.database.select(PUBLIC_COLUMNS).from(users).orderBy(asc(users.id)));
  }

  /** Runs a database operation and turns its failures into user domain errors. */
  private async accessStorage<T>(operation: () => PromiseLike<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const duplicateErrorCode = DUPLICATE_COLUMN_ERROR_CODES[findUniqueConstraintColumn(error) ?? ""];
      if (duplicateErrorCode) throw new UserValidationError(duplicateErrorCode);
      throw new UserPersistenceError("Could not access user storage.", { cause: error });
    }
  }
}
