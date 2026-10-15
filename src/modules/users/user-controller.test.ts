import { beforeEach, describe, expect, it } from "vitest";

import { InMemoryUserRepository } from "@/infra/users/in-memory-user-repository";

import {
  DuplicateUserError,
  InvalidLoginError,
  InvalidPasswordError,
  InvalidRoleError,
  type UserValidationErrorCode,
} from "./errors";
import type { Role } from "./role";
import type { NewUser } from "./user";
import { UserController } from "./user-controller";
import type { NewUserRecord } from "./user-repository";

function validUser(overrides: Partial<NewUser> = {}): NewUser {
  return {
    name: "Ana Silva",
    email: "ana@clinicore.com",
    login: "ana",
    password: "Secret@123",
    role: "RECEPTIONIST",
    ...overrides,
  };
}

/** Keeps what the controller hands to storage, to check hashing and normalization. */
class RecordingUserRepository extends InMemoryUserRepository {
  readonly records: NewUserRecord[] = [];

  override add(record: NewUserRecord) {
    this.records.push(record);
    return super.add(record);
  }
}

async function expectValidationError(
  operation: Promise<unknown>,
  errorClass: abstract new (...args: never[]) => Error,
  code: UserValidationErrorCode,
) {
  await expect(operation).rejects.toBeInstanceOf(errorClass);
  await expect(operation).rejects.toHaveProperty("code", code);
}

describe("adding and listing users", () => {
  let repository: RecordingUserRepository;
  let controller: UserController;

  beforeEach(() => {
    repository = new RecordingUserRepository();
    controller = new UserController(repository);
  });

  it("adds a user with a role and a unique identifier", async () => {
    const user = await controller.add(validUser());

    expect(user).toEqual({
      id: 1,
      name: "Ana Silva",
      email: "ana@clinicore.com",
      login: "ana",
      role: "RECEPTIONIST",
    });
  });

  it("lists the users kept by the repository", async () => {
    await controller.add(validUser());

    expect(await controller.list()).toEqual([
      { id: 1, name: "Ana Silva", email: "ana@clinicore.com", login: "ana", role: "RECEPTIONIST" },
    ]);
  });

  it("stores the e-mail in lowercase", async () => {
    const user = await controller.add(validUser({ email: "Ana.Silva@Clinicore.com" }));

    expect(user.email).toBe("ana.silva@clinicore.com");
    expect(repository.records[0].email).toBe("ana.silva@clinicore.com");
  });

  it("rejects an e-mail that differs from a registered one only in letter case", async () => {
    await controller.add(validUser());

    await expectValidationError(
      controller.add(validUser({ email: "ANA@Clinicore.com", login: "other" })),
      DuplicateUserError,
      "EMAIL_ALREADY_REGISTERED",
    );
  });

  it("rejects a role outside the allowed roles", async () => {
    await expectValidationError(controller.add(validUser({ role: "MANAGER" as Role })), InvalidRoleError, "INVALID_ROLE");
    expect(repository.records).toEqual([]);
  });
});

describe("login rules", () => {
  it.each<[scenario: string, login: string, code: UserValidationErrorCode]>([
    ["should reject an empty login", "", "LOGIN_EMPTY"],
    ["should reject a login with numbers", "ana1", "LOGIN_HAS_NUMBERS"],
    ["should reject a login longer than 12 characters", "abcdefghijklm", "LOGIN_TOO_LONG"],
  ])("%s", async (_scenario, login, code) => {
    const controller = new UserController(new InMemoryUserRepository());

    await expectValidationError(controller.add(validUser({ login })), InvalidLoginError, code);
  });

  it("should accept a login with exactly 12 characters", async () => {
    const controller = new UserController(new InMemoryUserRepository());

    const user = await controller.add(validUser({ login: "abcdefghijkl" }));

    expect(user.login).toBe("abcdefghijkl");
  });
});

describe("password rules (AWS IAM default policy)", () => {
  it.each<[scenario: string, password: string, code: UserValidationErrorCode, overrides?: Partial<NewUser>]>([
    ["should reject a password shorter than 8 characters", "Secret1", "PASSWORD_TOO_SHORT"],
    ["should reject a password longer than 128 characters", `Aa1${"a".repeat(126)}`, "PASSWORD_TOO_LONG"],
    ["should reject a password equal to the login", "Strong@Pass", "PASSWORD_EQUALS_LOGIN", { login: "Strong@Pass" }],
    [
      "should reject a password equal to the e-mail",
      "Ana@clinicore.com1",
      "PASSWORD_EQUALS_EMAIL",
      { email: "Ana@clinicore.com1" },
    ],
    ["should reject a lowercase-only password", "onlyletters", "PASSWORD_TOO_FEW_CHARACTER_TYPES"],
    ["should reject a password with only two character types", "ONLYLETTERS1", "PASSWORD_TOO_FEW_CHARACTER_TYPES"],
  ])("%s", async (_scenario, password, code, overrides = {}) => {
    const controller = new UserController(new InMemoryUserRepository());

    await expectValidationError(controller.add(validUser({ ...overrides, password })), InvalidPasswordError, code);
  });

  it("should accept a password of 8 to 128 characters with three character types", async () => {
    const controller = new UserController(new InMemoryUserRepository());

    const user = await controller.add(validUser({ password: "Secret123" }));

    expect(user.login).toBe("ana");
  });

  it("hands only a scrypt hash of the password to storage and never returns it", async () => {
    const repository = new RecordingUserRepository();
    const controller = new UserController(repository);

    const user = await controller.add(validUser());

    expect(repository.records[0].passwordHash).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/);
    expect(repository.records[0]).not.toHaveProperty("password");
    expect(user).not.toHaveProperty("password");
    expect(user).not.toHaveProperty("passwordHash");
  });
});
