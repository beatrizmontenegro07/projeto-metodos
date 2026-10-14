import { asc } from "drizzle-orm";

import type { Database } from "@/db";
import { findUniqueConstraintColumn } from "@/db/errors";
import { users } from "@/db/schema";

import { UserPersistenceError, UserValidationError, type UserValidationErrorCode } from "./errors";
import { hashPassword } from "./password";
import { normalizeEmail, validateLogin, validatePassword, validateRole } from "./rules";
import type { NewUser, User } from "./user";

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

export class UserController {
  constructor(private readonly database: Database) {}

  async add({ name, email, login, password, role }: NewUser): Promise<User> {
    validateRole(role);
    validateLogin(login);
    validatePassword(password, { login, email });

    const passwordHash = await hashPassword(password);
    // The unique indexes on e-mail and login are the only duplicate check, so two
    // concurrent registrations cannot both pass it (see accessStorage).
    const [user] = await this.accessStorage(() =>
      this.database
        .insert(users)
        .values({ name, email: normalizeEmail(email), login, passwordHash, role })
        .returning(PUBLIC_COLUMNS),
    );
    return user;
  }

  list(): Promise<User[]> {
    return this.accessStorage(() => this.database.select(PUBLIC_COLUMNS).from(users).orderBy(asc(users.id)));
  }

  /** Runs a storage operation and turns its failures into user domain errors. */
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
