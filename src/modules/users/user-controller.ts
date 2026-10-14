import { asc, eq, or } from "drizzle-orm";

import type { Database } from "@/db";
import { users } from "@/db/schema";

import { UserPersistenceError, UserValidationError } from "./errors";
import { hashPassword } from "./password";
import { validateLogin, validatePassword, validateRole } from "./rules";
import type { NewUser, User } from "./user";

const PUBLIC_COLUMNS = {
  id: users.id,
  name: users.name,
  email: users.email,
  login: users.login,
  role: users.role,
};

export class UserController {
  constructor(private readonly database: Database) {}

  async add({ name, email, login, password, role }: NewUser): Promise<User> {
    validateRole(role);
    validateLogin(login);
    validatePassword(password, { login, email });
    await this.ensureEmailAndLoginAreAvailable(email, login);

    const passwordHash = await hashPassword(password);
    const [user] = await this.accessStorage(() =>
      this.database.insert(users).values({ name, email, login, passwordHash, role }).returning(PUBLIC_COLUMNS),
    );
    return user;
  }

  list(): Promise<User[]> {
    return this.accessStorage(() => this.database.select(PUBLIC_COLUMNS).from(users).orderBy(asc(users.id)));
  }

  private async ensureEmailAndLoginAreAvailable(email: string, login: string): Promise<void> {
    const conflictingUsers = await this.accessStorage(() =>
      this.database
        .select({ email: users.email, login: users.login })
        .from(users)
        .where(or(eq(users.email, email), eq(users.login, login))),
    );
    if (conflictingUsers.some((user) => user.email === email)) {
      throw new UserValidationError("EMAIL_ALREADY_REGISTERED");
    }
    if (conflictingUsers.some((user) => user.login === login)) {
      throw new UserValidationError("LOGIN_ALREADY_REGISTERED");
    }
  }

  private async accessStorage<T>(operation: () => PromiseLike<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw new UserPersistenceError("Could not access user storage.", { cause: error });
    }
  }
}
