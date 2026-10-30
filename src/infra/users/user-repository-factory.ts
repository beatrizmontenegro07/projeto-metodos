import { getDatabase } from "@/db";
import { readStorageMechanism, type StorageMechanism } from "@/infra/storage-mechanism";
import type { UserRepository } from "@/modules/users/user-repository";

import { InMemoryUserRepository } from "./in-memory-user-repository";
import { SqliteUserRepository } from "./sqlite-user-repository";

export async function createUserRepository(mechanism: StorageMechanism): Promise<UserRepository> {
  if (mechanism === "memory") return new InMemoryUserRepository();
  return new SqliteUserRepository(await getDatabase());
}

const globalScope = globalThis as typeof globalThis & {
  applicationUserRepository?: Promise<UserRepository>;
};

/**
 * The process-wide repository, built once from the STORAGE variable at startup. It lives on
 * globalThis so `next dev` hot reloads do not drop the users kept in the RAM collection.
 */
export function getUserRepository(): Promise<UserRepository> {
  globalScope.applicationUserRepository ??= createUserRepository(readStorageMechanism(process.env.STORAGE));
  return globalScope.applicationUserRepository;
}
