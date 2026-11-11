import { beforeEach, describe, expect, it, vi } from "vitest";

import { InMemoryUserRepository } from "@/infra/users/in-memory-user-repository";
import { UserController } from "@/modules/users/user-controller";

import { AuthenticationController } from "./authentication-controller";
import { IncorrectCredentialsError, InvalidSignInIdentifierError, InvalidSignInPasswordError } from "./errors";

const ANA = { id: 1, name: "Ana Silva", email: "ana@clinicore.com", login: "ana", role: "RECEPTIONIST" } as const;

describe("signing in (RF06)", () => {
  let authentication: AuthenticationController;
  const recordSignIn = vi.fn<(userId: number) => void>();

  beforeEach(async () => {
    const repository = new InMemoryUserRepository();
    await new UserController(repository).add({ ...ANA, password: "Secret@123" });
    recordSignIn.mockReset();
    authentication = new AuthenticationController(repository, { recordSignIn });
  });

  it("signs in with the login and the password", async () => {
    expect(await authentication.signIn({ identifier: "ana", password: "Secret@123" })).toEqual(ANA);
    expect(recordSignIn).toHaveBeenCalledExactlyOnceWith(ANA.id);
  });

  it("signs in with the e-mail in any letter case", async () => {
    expect(await authentication.signIn({ identifier: " ANA@clinicore.com ", password: "Secret@123" })).toEqual(ANA);
    expect(recordSignIn).toHaveBeenCalledExactlyOnceWith(ANA.id);
  });

  it("keeps valid authentication available when logging fails", async () => {
    recordSignIn.mockImplementation(() => {
      throw new Error("Log destination unavailable");
    });

    expect(await authentication.signIn({ identifier: "ana", password: "Secret@123" })).toEqual(ANA);
    expect(recordSignIn).toHaveBeenCalledExactlyOnceWith(ANA.id);
  });

  it("should reject a wrong password", async () => {
    await expect(authentication.signIn({ identifier: "ana", password: "Wrong@123" })).rejects.toBeInstanceOf(
      IncorrectCredentialsError,
    );
    expect(recordSignIn).not.toHaveBeenCalled();
  });

  it("should reject an unknown login with the same error as a wrong password", async () => {
    await expect(authentication.signIn({ identifier: "bia", password: "Secret@123" })).rejects.toMatchObject({
      constructor: IncorrectCredentialsError,
      code: "CREDENTIALS_INCORRECT",
    });
    expect(recordSignIn).not.toHaveBeenCalled();
  });

  it("should reject an empty identifier", async () => {
    await expect(authentication.signIn({ identifier: "  ", password: "Secret@123" })).rejects.toMatchObject({
      constructor: InvalidSignInIdentifierError,
      code: "SIGN_IN_IDENTIFIER_EMPTY",
    });
    expect(recordSignIn).not.toHaveBeenCalled();
  });

  it("should reject an empty password", async () => {
    await expect(authentication.signIn({ identifier: "ana", password: "" })).rejects.toMatchObject({
      constructor: InvalidSignInPasswordError,
      code: "SIGN_IN_PASSWORD_EMPTY",
    });
    expect(recordSignIn).not.toHaveBeenCalled();
  });
});
