import { afterEach, describe, expect, it } from "vitest";

import { createDatabase, IN_MEMORY_DATABASE_URL, type Database } from "@/db";
import { InMemoryRepositoryFactory } from "@/infra/in-memory-repository-factory";
import { SqliteRepositoryFactory } from "@/infra/sqlite-repository-factory";

describe.each(["memory", "sqlite"] as const)("%s access record repository", (mechanism) => {
  let database: Database | undefined;
  afterEach(() => { database?.$client.close(); });

  async function create() {
    database = mechanism === "sqlite" ? await createDatabase(IN_MEMORY_DATABASE_URL) : undefined;
    const factory = database ? new SqliteRepositoryFactory(database) : new InMemoryRepositoryFactory();
    const user = await factory.createUserRepository().add({ name: "Ana", email: "ana@example.com", login: "ana", passwordHash: "hash", role: "ADMIN" });
    return { repository: factory.createAccessRecordRepository(), user };
  }

  it("starts empty and preserves repeated sign-ins with distinct identifiers", async () => {
    const { repository, user } = await create();
    expect(await repository.list()).toEqual([]);
    const record = { userId: user.id, occurredAt: "2026-11-11T12:00:00.000Z" };
    await repository.add(record);
    await repository.add(record);
    expect(await repository.list()).toEqual([{ id: 1, ...record }, { id: 2, ...record }]);
  });

  it("does not expose stored records to mutation through inputs or results", async () => {
    const { repository, user } = await create();
    const record = { userId: user.id, occurredAt: "2026-11-11T12:00:00.000Z" };
    await repository.add(record);
    record.userId = 999;
    const listed = await repository.list();
    listed[0].occurredAt = "changed";
    listed.pop();
    expect(await repository.list()).toEqual([{ id: 1, userId: user.id, occurredAt: "2026-11-11T12:00:00.000Z" }]);
  });
});
