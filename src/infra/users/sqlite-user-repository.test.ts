import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { applyMigrations, createDatabase } from "@/db";
import { users } from "@/db/schema";
import { UserPersistenceError } from "@/modules/users/errors";
import type { NewUserRecord } from "@/modules/users/user-repository";

import { SqliteUserRepository } from "./sqlite-user-repository";

const ANA: NewUserRecord = {
  name: "Ana Silva",
  email: "ana@clinicore.com",
  login: "ana",
  passwordHash: "salt:key",
  role: "RECEPTIONIST",
};

describe("SqliteUserRepository", () => {
  let temporaryFolder: string;

  beforeEach(() => {
    temporaryFolder = mkdtempSync(join(tmpdir(), "clinicore-"));
  });

  afterEach(() => {
    rmSync(temporaryFolder, { recursive: true, force: true });
  });

  it("persists users across runs when the database is a SQLite file", async () => {
    const url = `file:${join(temporaryFolder, "clinicore.db")}`;
    const firstRun = await createDatabase(url);
    await applyMigrations(firstRun);
    await new SqliteUserRepository(firstRun).add(ANA);
    firstRun.$client.close();

    const secondRun = new SqliteUserRepository(await createDatabase(url));

    expect(await secondRun.list()).toHaveLength(1);
  });

  it("stores the password hash it receives", async () => {
    const url = `file:${join(temporaryFolder, "clinicore.db")}`;
    const database = await createDatabase(url);
    await applyMigrations(database);

    await new SqliteUserRepository(database).add(ANA);
    const [row] = await database.select().from(users);

    expect(row.passwordHash).toBe("salt:key");
  });

  it("turns database failures into a persistence error", async () => {
    const databaseWithoutTables = await createDatabase(`file:${join(temporaryFolder, "empty.db")}`);
    const repository = new SqliteUserRepository(databaseWithoutTables);

    await expect(repository.list()).rejects.toBeInstanceOf(UserPersistenceError);
    await expect(repository.add(ANA)).rejects.toBeInstanceOf(UserPersistenceError);
  });
});
