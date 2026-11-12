import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { applyMigrations, createDatabase, type Database } from "@/db";
import { AccessRecordPersistenceError } from "@/modules/access-records/errors";
import { SqliteRepositoryFactory } from "@/infra/sqlite-repository-factory";
import { SqliteAccessRecordRepository } from "./sqlite-access-record-repository";

describe("SQLite access record durability and failures", () => {
  let folder: string;
  const connections: Database[] = [];
  beforeEach(() => { folder = mkdtempSync(join(tmpdir(), "clinicore-access-")); });
  afterEach(() => {
    for (const database of connections.splice(0)) database.$client.close();
    rmSync(folder, { recursive: true, force: true });
  });

  it("keeps access records after reopening a file database", async () => {
    const url = `file:${join(folder, "access.db")}`;
    const first = await createDatabase(url);
    await applyMigrations(first);
    const factory = new SqliteRepositoryFactory(first);
    const user = await factory.createUserRepository().add({ name: "Ana", email: "ana@example.com", login: "ana", passwordHash: "hash", role: "ADMIN" });
    const record = { userId: user.id, occurredAt: "2026-11-11T12:00:00.000Z" };
    await factory.createAccessRecordRepository().add(record);
    first.$client.close();
    const second = await createDatabase(url);
    connections.push(second);
    expect(await new SqliteAccessRecordRepository(second).list()).toEqual([{ id: 1, ...record }]);
  });

  it("wraps read and write failures with the access persistence error", async () => {
    const empty = await createDatabase(`file:${join(folder, "empty.db")}`);
    connections.push(empty);
    const repository = new SqliteAccessRecordRepository(empty);
    await expect(repository.list()).rejects.toBeInstanceOf(AccessRecordPersistenceError);
    await expect(repository.add({ userId: 1, occurredAt: "2026-11-11T12:00:00.000Z" })).rejects.toBeInstanceOf(AccessRecordPersistenceError);
  });
});
