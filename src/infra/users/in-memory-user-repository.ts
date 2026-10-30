import { DuplicateUserError } from "@/modules/users/errors";
import type { User } from "@/modules/users/user";
import type {
  CredentialsLookup,
  NewUserRecord,
  UserCredentials,
  UserRepository,
} from "@/modules/users/user-repository";

type StoredUser = User & { passwordHash: string };

/** RAM mechanism: users live in a collection and are lost when the process exits. */
export class InMemoryUserRepository implements UserRepository {
  private readonly storedUsers: StoredUser[] = [];
  private nextId = 1;

  async add(record: NewUserRecord): Promise<User> {
    this.ensureEmailAndLoginAreAvailable(record);
    const storedUser: StoredUser = { id: this.nextId++, ...record };
    this.storedUsers.push(storedUser);
    return toPublicUser(storedUser);
  }

  async list(): Promise<User[]> {
    return this.storedUsers.map(toPublicUser);
  }

  async findById(id: number): Promise<User | undefined> {
    const storedUser = this.storedUsers.find((user) => user.id === id);
    return storedUser && toPublicUser(storedUser);
  }

  async findCredentials({ login, email }: CredentialsLookup): Promise<UserCredentials | undefined> {
    const storedUser =
      this.storedUsers.find((user) => user.login === login) ?? this.storedUsers.find((user) => user.email === email);
    return storedUser && { user: toPublicUser(storedUser), passwordHash: storedUser.passwordHash };
  }

  async count(): Promise<number> {
    return this.storedUsers.length;
  }

  private ensureEmailAndLoginAreAvailable({ email, login }: NewUserRecord): void {
    if (this.storedUsers.some((user) => user.email === email)) {
      throw new DuplicateUserError("EMAIL_ALREADY_REGISTERED");
    }
    if (this.storedUsers.some((user) => user.login === login)) {
      throw new DuplicateUserError("LOGIN_ALREADY_REGISTERED");
    }
  }
}

function toPublicUser({ id, name, email, login, role }: StoredUser): User {
  return { id, name, email, login, role };
}
