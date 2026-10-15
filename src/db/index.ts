import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

import * as schema from "./schema";

/** URL that selects RAM storage: data exists only while the process runs. */
export const IN_MEMORY_DATABASE_URL = ":memory:";
const MIGRATIONS_FOLDER = "drizzle";

export type Database = ReturnType<typeof connect>;

function connect(url: string, authToken?: string) {
  return drizzle({ connection: { url, authToken }, schema });
}

export async function applyMigrations(database: Database): Promise<void> {
  await migrate(database, { migrationsFolder: MIGRATIONS_FOLDER });
}

export async function createDatabase(url: string, authToken?: string): Promise<Database> {
  const database = connect(url, authToken);
  // Permanent databases (local file or Turso) are migrated by `npm run db:migrate`;
  // an in-memory database starts empty on every run and needs the schema right away.
  if (url === IN_MEMORY_DATABASE_URL) await applyMigrations(database);
  return database;
}

const globalScope = globalThis as typeof globalThis & {
  applicationDatabase?: Promise<Database>;
};

/**
 * The process-wide connection. The storage mechanism is chosen at startup by
 * DATABASE_URL. It lives on globalThis so `next dev` hot reloads do not drop
 * the in-memory database.
 */
export function getDatabase(): Promise<Database> {
  globalScope.applicationDatabase ??= createDatabase(readDatabaseUrl(), process.env.DATABASE_AUTH_TOKEN);
  return globalScope.applicationDatabase;
}

function readDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Copy .env.sample to .env.local.");
  return url;
}
