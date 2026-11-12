import type { AccessRecord, AccessRecordRepository, NewAccessRecord } from "@/modules/access-records/access-record-repository";

export class InMemoryAccessRecordRepository implements AccessRecordRepository {
  private readonly records: AccessRecord[] = [];
  private nextId = 1;

  async add(record: NewAccessRecord): Promise<void> {
    this.records.push({ id: this.nextId++, userId: record.userId, occurredAt: record.occurredAt });
  }

  async list(): Promise<AccessRecord[]> {
    return this.records.map((record) => ({ ...record }));
  }
}
