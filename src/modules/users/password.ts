import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";

const deriveKey = promisify(scrypt) as (password: string, salt: string, keyLength: number) => Promise<Buffer>;

const SALT_LENGTH_IN_BYTES = 16;
const KEY_LENGTH_IN_BYTES = 64;

/**
 * Produces the value stored in `users.password_hash`, formatted as `<salt hex>:<scrypt key hex>`.
 * Verifying a password at sign-in must derive the key with the same salt and key length.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH_IN_BYTES).toString("hex");
  const key = await deriveKey(password, salt, KEY_LENGTH_IN_BYTES);
  return `${salt}:${key.toString("hex")}`;
}
