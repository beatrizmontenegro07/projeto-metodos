import { hashPassword, verifyPassword } from "@/modules/users/password";
import { normalizeEmail } from "@/modules/users/rules";
import type { User } from "@/modules/users/user";
import type { UserRepository } from "@/modules/users/user-repository";

import { IncorrectCredentialsError, InvalidSignInIdentifierError, InvalidSignInPasswordError } from "./errors";

export type SignInCredentials = {
  /** The login or the e-mail. */
  identifier: string;
  password: string;
};

// Compared against when the login does not exist, so an unknown login takes as long to
// refuse as a wrong password and the response time does not reveal which users exist.
let unknownUserHash: Promise<string> | undefined;

export class AuthenticationController {
  constructor(private readonly repository: UserRepository) {}

  async signIn({ identifier, password }: SignInCredentials): Promise<User> {
    const trimmedIdentifier = identifier.trim();
    if (trimmedIdentifier.length === 0) throw new InvalidSignInIdentifierError();
    if (password.length === 0) throw new InvalidSignInPasswordError();

    const credentials = await this.repository.findCredentials({
      login: trimmedIdentifier,
      email: normalizeEmail(trimmedIdentifier),
    });
    unknownUserHash ??= hashPassword("unknown user");
    const passwordMatches = await verifyPassword(password, credentials?.passwordHash ?? (await unknownUserHash));
    if (!credentials || !passwordMatches) throw new IncorrectCredentialsError();
    return credentials.user;
  }
}
