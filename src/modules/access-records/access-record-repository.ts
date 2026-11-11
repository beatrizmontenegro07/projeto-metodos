export type AccessRecord = { id: number; userId: number; occurredAt: string };
export type NewAccessRecord = Omit<AccessRecord, "id">;

/** Accepted credentials, recorded in UTC before opening the session; never includes secrets. */
export interface AccessRecordRepository {
  add(record: NewAccessRecord): Promise<void>;
  /** All records in insertion order, including repeated sign-ins by the same user. */
  list(): Promise<AccessRecord[]>;
}
