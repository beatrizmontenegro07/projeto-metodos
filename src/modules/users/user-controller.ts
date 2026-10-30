import { FirstAdministratorExistsError } from "./errors";
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

  /** RF16: while no user exists, anyone may create the first user, who is always an administrator. */
  async addFirstAdministrator(newUser: Omit<NewUser, "role">): Promise<User> {
    if (await this.hasUsers()) throw new FirstAdministratorExistsError();
    return this.add({ ...newUser, role: "ADMIN" });
  }

  async hasUsers(): Promise<boolean> {
    return (await this.repository.count()) > 0;
  }

  list(): Promise<User[]> {
    return this.repository.list();
  }

  findById(id: number): Promise<User | undefined> {
    return this.repository.findById(id);
  }

  count(): Promise<number> {
    return this.repository.count();
  }
}
