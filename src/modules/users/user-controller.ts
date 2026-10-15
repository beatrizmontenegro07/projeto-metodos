import { hashPassword } from "./password";
import { normalizeEmail, validateLogin, validatePassword, validateRole } from "./rules";
import type { NewUser, User } from "./user";
import type { UserRepository } from "./user-repository";

export class UserController {
  /** Receives the storage port, never a concrete mechanism (see user-repository-factory). */
  constructor(private readonly repository: UserRepository) {}

  async add({ name, email, login, password, role }: NewUser): Promise<User> {
    validateRole(role);
    validateLogin(login);
    validatePassword(password, { login, email });

    const passwordHash = await hashPassword(password);
    return this.repository.add({ name, email: normalizeEmail(email), login, passwordHash, role });
  }

  list(): Promise<User[]> {
    return this.repository.list();
  }
}
