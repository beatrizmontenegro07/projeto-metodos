import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { applyMigrations, createDatabase, IN_MEMORY_DATABASE_URL } from "@/db";
import { users } from "@/db/schema";

import { UserPersistenceError, UserValidationError, type UserValidationErrorCode } from "./errors";
import type { Role } from "./role";
import type { NewUser } from "./user";
import { UserController } from "./user-controller";

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

async function createInMemoryController() {
  return new UserController(await createDatabase(IN_MEMORY_DATABASE_URL));
}

async function expectValidationError(operation: Promise<unknown>, code: UserValidationErrorCode) {
  await expect(operation).rejects.toBeInstanceOf(UserValidationError);
  await expect(operation).rejects.toHaveProperty("code", code);
}

describe("adding and listing users", () => {
  let controller: UserController;

  beforeEach(async () => {
    controller = await createInMemoryController();
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

  it("rejects a duplicate e-mail without adding a second user", async () => {
    await controller.add(validUser());

    await expectValidationError(
      controller.add(validUser({ name: "Other Ana", login: "other", role: "DOCTOR" })),
      "EMAIL_ALREADY_REGISTERED",
    );
    expect(await controller.list()).toHaveLength(1);
  });

  it("rejects a duplicate login without adding a second user", async () => {
    await controller.add(validUser());

    await expectValidationError(
      controller.add(validUser({ email: "other@clinicore.com" })),
      "LOGIN_ALREADY_REGISTERED",
    );
    expect(await controller.list()).toHaveLength(1);
  });

  it("rejects a duplicate login added concurrently without adding a second user", async () => {
    const results = await Promise.allSettled([
      controller.add(validUser({ email: "first@clinicore.com" })),
      controller.add(validUser({ email: "second@clinicore.com" })),
    ]);

    const rejection = results.find((result) => result.status === "rejected");
    expect(rejection?.reason).toBeInstanceOf(UserValidationError);
    expect(rejection?.reason).toHaveProperty("code", "LOGIN_ALREADY_REGISTERED");
    expect(await controller.list()).toHaveLength(1);
  });

  it("rejects a duplicate e-mail added concurrently without adding a second user", async () => {
    const results = await Promise.allSettled([
      controller.add(validUser({ login: "first" })),
      controller.add(validUser({ login: "second" })),
    ]);

    const rejection = results.find((result) => result.status === "rejected");
    expect(rejection?.reason).toBeInstanceOf(UserValidationError);
    expect(rejection?.reason).toHaveProperty("code", "EMAIL_ALREADY_REGISTERED");
    expect(await controller.list()).toHaveLength(1);
  });

  it("stores the e-mail in lowercase", async () => {
    const user = await controller.add(validUser({ email: "Ana.Silva@Clinicore.com" }));

    expect(user.email).toBe("ana.silva@clinicore.com");
    expect((await controller.list())[0].email).toBe("ana.silva@clinicore.com");
  });

  it("rejects an e-mail that differs from a registered one only in letter case", async () => {
    await controller.add(validUser());

    await expectValidationError(
      controller.add(validUser({ email: "ANA@Clinicore.com", login: "other" })),
      "EMAIL_ALREADY_REGISTERED",
    );
    expect(await controller.list()).toHaveLength(1);
  });

  it("rejects a role outside the allowed roles", async () => {
    await expectValidationError(controller.add(validUser({ role: "MANAGER" as Role })), "INVALID_ROLE");
  });

  it("lists every user in registration order", async () => {
    await controller.add(validUser());
    await controller.add(
      validUser({ name: "Dr. Bruno Lima", email: "bruno@clinicore.com", login: "bruno", role: "DOCTOR" }),
    );

    const listedUsers = await controller.list();

    expect(listedUsers.map(({ id, name, role }) => ({ id, name, role }))).toEqual([
      { id: 1, name: "Ana Silva", role: "RECEPTIONIST" },
      { id: 2, name: "Dr. Bruno Lima", role: "DOCTOR" },
    ]);
  });

  it("does not let the value returned by add change the stored user", async () => {
    const user = await controller.add(validUser());

    user.email = "other@clinicore.com";
    user.role = "ADMIN";

    const [storedUser] = await controller.list();
    expect(storedUser.email).toBe("ana@clinicore.com");
    expect(storedUser.role).toBe("RECEPTIONIST");
  });

  it("does not let a listed value change the stored user", async () => {
    await controller.add(validUser());

    const [user] = await controller.list();
    user.role = "ADMIN";

    expect((await controller.list())[0].role).toBe("RECEPTIONIST");
  });
});

describe("login rules", () => {
  it.each([
    ["should reject an empty login", ""],
    ["should reject a login with numbers", "ana1"],
    ["should reject a login longer than 12 characters", "abcdefghijklm"],
  ])("%s", async (_scenario, login) => {
    const controller = await createInMemoryController();

    await expectValidationError(controller.add(validUser({ login })), "INVALID_LOGIN");
  });

  it("should accept a login with exactly 12 characters", async () => {
    const controller = await createInMemoryController();

    const user = await controller.add(validUser({ login: "abcdefghijkl" }));

    expect(user.login).toBe("abcdefghijkl");
  });
});

describe("password rules (AWS IAM default policy)", () => {
  it.each<[scenario: string, password: string, code: UserValidationErrorCode, overrides?: Partial<NewUser>]>([
    ["should reject a password shorter than 8 characters", "Secret1", "PASSWORD_POLICY_VIOLATION"],
    ["should reject a password longer than 128 characters", `Aa1${"a".repeat(126)}`, "PASSWORD_POLICY_VIOLATION"],
    ["should reject a password equal to the login", "Strong@Pass", "PASSWORD_POLICY_VIOLATION", { login: "Strong@Pass" }],
    [
      "should reject a password equal to the e-mail",
      "Ana@clinicore.com1",
      "PASSWORD_POLICY_VIOLATION",
      { email: "Ana@clinicore.com1" },
    ],
    ["should reject a lowercase-only password", "onlyletters", "PASSWORD_TOO_FEW_CHARACTER_TYPES"],
    ["should reject a password with only two character types", "ONLYLETTERS1", "PASSWORD_TOO_FEW_CHARACTER_TYPES"],
  ])("%s", async (_scenario, password, code, overrides = {}) => {
    const controller = await createInMemoryController();

    await expectValidationError(controller.add(validUser({ ...overrides, password })), code);
  });

  it("should accept a password of 8 to 128 characters with three character types", async () => {
    const controller = await createInMemoryController();

    const user = await controller.add(validUser({ password: "Secret123" }));

    expect(user.login).toBe("ana");
  });

  it("never exposes or stores the plaintext password", async () => {
    const database = await createDatabase(IN_MEMORY_DATABASE_URL);
    const controller = new UserController(database);

    const user = await controller.add(validUser());
    const [row] = await database.select().from(users);

    expect(user).not.toHaveProperty("password");
    expect(user).not.toHaveProperty("passwordHash");
    expect(await controller.list()).not.toContainEqual(expect.objectContaining({ passwordHash: expect.anything() }));
    expect(row.passwordHash).not.toContain("Secret@123");
  });
});

describe("storage mechanism chosen at startup", () => {
  let temporaryFolder: string;

  beforeEach(() => {
    temporaryFolder = mkdtempSync(join(tmpdir(), "clinicore-"));
  });

  afterEach(() => {
    rmSync(temporaryFolder, { recursive: true, force: true });
  });

  it("keeps users only in memory when the URL is :memory:", async () => {
    await (await createInMemoryController()).add(validUser());

    const nextRun = await createInMemoryController();

    expect(await nextRun.list()).toEqual([]);
  });

  it("persists users across runs when the database is a SQLite file", async () => {
    const url = `file:${join(temporaryFolder, "clinicore.db")}`;
    const firstRun = await createDatabase(url);
    await applyMigrations(firstRun);
    await new UserController(firstRun).add(validUser());
    firstRun.$client.close();

    const secondRun = new UserController(await createDatabase(url));

    expect(await secondRun.list()).toHaveLength(1);
  });

  it("turns database failures into a persistence error", async () => {
    const databaseWithoutTables = await createDatabase(`file:${join(temporaryFolder, "empty.db")}`);
    const controller = new UserController(databaseWithoutTables);

    await expect(controller.list()).rejects.toBeInstanceOf(UserPersistenceError);
  });
});
