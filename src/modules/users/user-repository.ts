import type { User } from "./user";

/** What the business layer hands to storage: e-mail already normalized, password already hashed. */
export type NewUserRecord = Omit<User, "id"> & { passwordHash: string };

/** What a person typed to sign in, as a login and as a normalized e-mail. */
export type CredentialsLookup = { login: string; email: string };

/** A user with the stored hash, used only to verify a password at sign-in. */
export type UserCredentials = { user: User; passwordHash: string };

/**
 * Storage port for users. The business layer depends only on this interface; each storage
 * mechanism (RAM collection, SQLite) implements it in `src/infra/users`.
 *
 * Implementations must reject a repeated e-mail or login with `DuplicateUserError`
 * (`EMAIL_ALREADY_REGISTERED` / `LOGIN_ALREADY_REGISTERED`), wrap storage failures in
 * `UserPersistenceError`, and return the password hash only from `findCredentials`.
 */
export interface UserRepository {
  add(record: NewUserRecord): Promise<User>;
  list(): Promise<User[]>;
  findById(id: number): Promise<User | undefined>;
  /** Matches the exact login first and, when no login matches, the e-mail. */
  findCredentials(lookup: CredentialsLookup): Promise<UserCredentials | undefined>;
  count(): Promise<number>;
}
