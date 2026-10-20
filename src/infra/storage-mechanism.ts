export const STORAGE_MECHANISMS = ["memory", "sqlite"] as const;

export type StorageMechanism = (typeof STORAGE_MECHANISMS)[number];

/** Reads the STORAGE variable, which picks one mechanism for every entity at startup. */
export function readStorageMechanism(value: string | undefined): StorageMechanism {
  if (!STORAGE_MECHANISMS.includes(value as StorageMechanism)) {
    throw new Error(`STORAGE must be one of: ${STORAGE_MECHANISMS.join(", ")}. Copy .env.sample to .env.local.`);
  }
  return value as StorageMechanism;
}
