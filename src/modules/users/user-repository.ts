import type { User } from "./user";

/** What the business layer hands to storage: e-mail already normalized, password already hashed. */
export type NewUserRecord = Omit<User, "id"> & { passwordHash: string };

/**
 * Storage port for users. The business layer depends only on this interface; each storage
 * mechanism (RAM collection, SQLite) implements it in `src/infra/users`.
 *
 * Implementations must reject a repeated e-mail or login with `DuplicateUserError`
 * (`EMAIL_ALREADY_REGISTERED` / `LOGIN_ALREADY_REGISTERED`), wrap storage failures in
 * `UserPersistenceError`, and never return the password hash.
 */
export interface UserRepository {
  add(record: NewUserRecord): Promise<User>;
  list(): Promise<User[]>;
}
