// SQLite reports a unique index violation as "UNIQUE constraint failed: <table>.<column>",
// wrapped by Drizzle and libSQL in a chain of `cause` errors.
const UNIQUE_CONSTRAINT_VIOLATION = /UNIQUE constraint failed: \w+\.(\w+)/;

/** Returns the column whose unique constraint `error` violated, or undefined for any other error. */
export function findUniqueConstraintColumn(error: unknown): string | undefined {
  for (let current = error; current instanceof Error; current = current.cause) {
    const violation = UNIQUE_CONSTRAINT_VIOLATION.exec(current.message);
    if (violation) return violation[1];
  }
  return undefined;
}
