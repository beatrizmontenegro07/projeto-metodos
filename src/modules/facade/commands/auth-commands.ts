import type { AuthenticationController, SignInCredentials } from "@/modules/auth/authentication-controller";
import type { User } from "@/modules/users/user";

import type { Command } from "./command";

/** RF06: the receiver is `AuthenticationController`. */
export class SignInCommand implements Command<User> {
  constructor(
    private readonly authentication: AuthenticationController,
    private readonly credentials: SignInCredentials,
  ) {}

  execute(): Promise<User> {
    return this.authentication.signIn(this.credentials);
  }
}
