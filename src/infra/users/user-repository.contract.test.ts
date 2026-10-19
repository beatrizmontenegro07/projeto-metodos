import { beforeEach, describe, expect, it } from "vitest";

import { createDatabase, IN_MEMORY_DATABASE_URL } from "@/db";
import { UserValidationError } from "@/modules/users/errors";
import type { NewUserRecord, UserRepository } from "@/modules/users/user-repository";

import { InMemoryUserRepository } from "./in-memory-user-repository";
import { SqliteUserRepository } from "./sqlite-user-repository";

// Both mechanisms must behave the same, so the controller can use either one.
const implementations: [name: string, create: () => Promise<UserRepository>][] = [
  ["InMemoryUserRepository", async () => new InMemoryUserRepository()],
  ["SqliteUserRepository", async () => new SqliteUserRepository(await createDatabase(IN_MEMORY_DATABASE_URL))],
];

function record(overrides: Partial<NewUserRecord> = {}): NewUserRecord {
  return {
    name: "Ana Silva",
    email: "ana@clinicore.com",
    login: "ana",
    passwordHash: "salt:key",
    role: "RECEPTIONIST",
    ...overrides,
  };
}

describe.each(implementations)("%s", (_name, createRepository) => {
  let repository: UserRepository;

  beforeEach(async () => {
    repository = await createRepository();
  });

  it("adds a user with a unique identifier and without the password hash", async () => {
    const user = await repository.add(record());

    expect(user).toEqual({ id: 1, name: "Ana Silva", email: "ana@clinicore.com", login: "ana", role: "RECEPTIONIST" });
  });

  it("lists every user in registration order without the password hash", async () => {
    await repository.add(record());
    await repository.add(record({ name: "Dr. Bruno Lima", email: "bruno@clinicore.com", login: "bruno", role: "DOCTOR" }));

    expect(await repository.list()).toEqual([
      { id: 1, name: "Ana Silva", email: "ana@clinicore.com", login: "ana", role: "RECEPTIONIST" },
      { id: 2, name: "Dr. Bruno Lima", email: "bruno@clinicore.com", login: "bruno", role: "DOCTOR" },
    ]);
  });

  it("rejects a repeated e-mail without adding a second user", async () => {
    await repository.add(record());

    await expect(repository.add(record({ login: "other" }))).rejects.toMatchObject({
      constructor: UserValidationError,
      code: "EMAIL_ALREADY_REGISTERED",
    });
    expect(await repository.list()).toHaveLength(1);
  });

  it("rejects a repeated login without adding a second user", async () => {
    await repository.add(record());

    await expect(repository.add(record({ email: "other@clinicore.com" }))).rejects.toMatchObject({
      constructor: UserValidationError,
      code: "LOGIN_ALREADY_REGISTERED",
    });
    expect(await repository.list()).toHaveLength(1);
  });

  it("rejects a repeated login added concurrently without adding a second user", async () => {
    const results = await Promise.allSettled([
      repository.add(record({ email: "first@clinicore.com" })),
      repository.add(record({ email: "second@clinicore.com" })),
    ]);

    const rejection = results.find((result) => result.status === "rejected");
    expect(rejection?.reason).toMatchObject({ constructor: UserValidationError, code: "LOGIN_ALREADY_REGISTERED" });
    expect(await repository.list()).toHaveLength(1);
  });

  it("does not let returned or listed values change the stored user", async () => {
    const added = await repository.add(record());
    added.role = "ADMIN";
    const [listed] = await repository.list();
    listed.email = "other@clinicore.com";

    expect(await repository.list()).toEqual([
      { id: 1, name: "Ana Silva", email: "ana@clinicore.com", login: "ana", role: "RECEPTIONIST" },
    ]);
  });
});

describe("InMemoryUserRepository", () => {
  it("keeps users only while the process runs: a new repository starts empty", async () => {
    await new InMemoryUserRepository().add(record());

    expect(await new InMemoryUserRepository().list()).toEqual([]);
  });
});
