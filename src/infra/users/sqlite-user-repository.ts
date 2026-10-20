import { asc, count, eq, type SQL } from "drizzle-orm";

import type { Database } from "@/db";
import { findUniqueConstraintColumn } from "@/db/errors";
import { users } from "@/db/schema";
import { DuplicateUserError, type DuplicateUserErrorCode, UserPersistenceError } from "@/modules/users/errors";
import type { User } from "@/modules/users/user";
import type {
  CredentialsLookup,
  NewUserRecord,
  UserCredentials,
  UserRepository,
} from "@/modules/users/user-repository";

const PUBLIC_COLUMNS = {
  id: users.id,
  name: users.name,
  email: users.email,
  login: users.login,
  role: users.role,
};

const DUPLICATE_COLUMN_ERROR_CODES: Partial<Record<string, DuplicateUserErrorCode>> = {
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

  async findById(id: number): Promise<User | undefined> {
    const [user] = await this.accessStorage(() =>
      this.database.select(PUBLIC_COLUMNS).from(users).where(eq(users.id, id)),
    );
    return user;
  }

  async findCredentials({ login, email }: CredentialsLookup): Promise<UserCredentials | undefined> {
    return (await this.findCredentialsWhere(eq(users.login, login))) ?? this.findCredentialsWhere(eq(users.email, email));
  }

  async count(): Promise<number> {
    const [{ total }] = await this.accessStorage(() => this.database.select({ total: count() }).from(users));
    return total;
  }

  private async findCredentialsWhere(condition: SQL): Promise<UserCredentials | undefined> {
    const [row] = await this.accessStorage(() =>
      this.database
        .select({ user: PUBLIC_COLUMNS, passwordHash: users.passwordHash })
        .from(users)
        .where(condition),
    );
    return row;
  }

  /** Runs a database operation and turns its failures into user domain errors. */
  private async accessStorage<T>(operation: () => PromiseLike<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const duplicateErrorCode = DUPLICATE_COLUMN_ERROR_CODES[findUniqueConstraintColumn(error) ?? ""];
      if (duplicateErrorCode) throw new DuplicateUserError(duplicateErrorCode);
      throw new UserPersistenceError("Could not access user storage.", { cause: error });
    }
  }
}
