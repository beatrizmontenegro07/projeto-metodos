import type { NewUser, User } from "@/modules/users/user";
import type { UserController } from "@/modules/users/user-controller";

import type { Command } from "./command";

/** Commands whose receiver is `UserController`. */
export class FindUserCommand implements Command<User | undefined> {
  constructor(
    private readonly users: UserController,
    private readonly id: number,
  ) {}

  execute(): Promise<User | undefined> {
    return this.users.findById(this.id);
  }
}

export class HasUsersCommand implements Command<boolean> {
  constructor(private readonly users: UserController) {}

  execute(): Promise<boolean> {
    return this.users.hasUsers();
  }
}

export class CreateFirstAdministratorCommand implements Command<User> {
  constructor(
    private readonly users: UserController,
    private readonly newUser: Omit<NewUser, "role">,
  ) {}

  execute(): Promise<User> {
    return this.users.addFirstAdministrator(this.newUser);
  }
}

export class AddUserCommand implements Command<User> {
  constructor(
    private readonly users: UserController,
    private readonly newUser: NewUser,
  ) {}

  execute(): Promise<User> {
    return this.users.add(this.newUser);
  }
}

export class ListUsersCommand implements Command<User[]> {
  constructor(private readonly users: UserController) {}

  execute(): Promise<User[]> {
    return this.users.list();
  }
}
