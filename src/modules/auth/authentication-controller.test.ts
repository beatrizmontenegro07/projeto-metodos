import { beforeEach, describe, expect, it } from "vitest";

import { InMemoryUserRepository } from "@/infra/users/in-memory-user-repository";
import { UserController } from "@/modules/users/user-controller";

import { AuthenticationController } from "./authentication-controller";
import { IncorrectCredentialsError, InvalidSignInIdentifierError, InvalidSignInPasswordError } from "./errors";

const ANA = { id: 1, name: "Ana Silva", email: "ana@clinicore.com", login: "ana", role: "RECEPTIONIST" } as const;

describe("signing in (RF06)", () => {
  let authentication: AuthenticationController;

  beforeEach(async () => {
    const repository = new InMemoryUserRepository();
    await new UserController(repository).add({ ...ANA, password: "Secret@123" });
    authentication = new AuthenticationController(repository);
  });

  it("signs in with the login and the password", async () => {
    expect(await authentication.signIn({ identifier: "ana", password: "Secret@123" })).toEqual(ANA);
  });

  it("signs in with the e-mail in any letter case", async () => {
    expect(await authentication.signIn({ identifier: " ANA@clinicore.com ", password: "Secret@123" })).toEqual(ANA);
  });

  it("should reject a wrong password", async () => {
    await expect(authentication.signIn({ identifier: "ana", password: "Wrong@123" })).rejects.toBeInstanceOf(
      IncorrectCredentialsError,
    );
  });

  it("should reject an unknown login with the same error as a wrong password", async () => {
    await expect(authentication.signIn({ identifier: "bia", password: "Secret@123" })).rejects.toMatchObject({
      constructor: IncorrectCredentialsError,
      code: "CREDENTIALS_INCORRECT",
    });
  });

  it("should reject an empty identifier", async () => {
    await expect(authentication.signIn({ identifier: "  ", password: "Secret@123" })).rejects.toMatchObject({
      constructor: InvalidSignInIdentifierError,
      code: "SIGN_IN_IDENTIFIER_EMPTY",
    });
  });

  it("should reject an empty password", async () => {
    await expect(authentication.signIn({ identifier: "ana", password: "" })).rejects.toMatchObject({
      constructor: InvalidSignInPasswordError,
      code: "SIGN_IN_PASSWORD_EMPTY",
    });
  });
});
