import { asc } from "drizzle-orm";

import type { Database } from "@/db";
import { accessRecords } from "@/db/schema";
import type { AccessRecord, AccessRecordRepository, NewAccessRecord } from "@/modules/access-records/access-record-repository";
import { AccessRecordPersistenceError } from "@/modules/access-records/errors";

export class SqliteAccessRecordRepository implements AccessRecordRepository {
  constructor(private readonly database: Database) {}

  async add({ userId, occurredAt }: NewAccessRecord): Promise<void> {
    await this.accessStorage(() => this.database.insert(accessRecords).values({ userId, occurredAt }));
  }

  list(): Promise<AccessRecord[]> {
    return this.accessStorage(() => this.database.select({
      id: accessRecords.id, userId: accessRecords.userId, occurredAt: accessRecords.occurredAt,
    }).from(accessRecords).orderBy(asc(accessRecords.id)));
  }

  private async accessStorage<T>(operation: () => PromiseLike<T>): Promise<T> {
    try {
      return await operation();
    } catch (cause) {
      throw new AccessRecordPersistenceError("Could not access sign-in records.", { cause });
    }
  }
}