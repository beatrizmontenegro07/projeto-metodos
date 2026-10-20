import { jwtVerify, SignJWT } from "jose";

/** RF06: a session lasts one 8-hour work shift. */
export const SESSION_DURATION_IN_SECONDS = 8 * 60 * 60;

const SIGNING_ALGORITHM = "HS256";
const MIN_SECRET_LENGTH = 32;
const MILLISECONDS_PER_SECOND = 1000;

/** What the session cookie proves: who signed in. The role is read from storage on every request. */
export type SessionClaims = {
  userId: number;
  login: string;
};

export type SessionToken = {
  token: string;
  expiresAt: Date;
};

export function readSessionSecret(value: string | undefined): Uint8Array {
  if (!value || value.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `SESSION_SECRET must have at least ${MIN_SECRET_LENGTH} characters. Copy .env.sample to .env.local.`,
    );
  }
  return new TextEncoder().encode(value);
}

export async function createSessionToken(
  { userId, login }: SessionClaims,
  secret: Uint8Array,
  now: Date = new Date(),
): Promise<SessionToken> {
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_IN_SECONDS * MILLISECONDS_PER_SECOND);
  const token = await new SignJWT({ login })
    .setProtectedHeader({ alg: SIGNING_ALGORITHM })
    .setSubject(String(userId))
    .setIssuedAt(toSeconds(now))
    .setExpirationTime(toSeconds(expiresAt))
    .sign(secret);
  return { token, expiresAt };
}

/** Returns the claims of a valid token; a missing, tampered or expired token means no session. */
export async function readSessionToken(
  token: string | undefined,
  secret: Uint8Array,
  now: Date = new Date(),
): Promise<SessionClaims | undefined> {
  if (!token) return undefined;
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [SIGNING_ALGORITHM],
      currentDate: now,
    });
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || typeof payload.login !== "string") return undefined;
    return { userId, login: payload.login };
  } catch {
    return undefined;
  }
}

function toSeconds(date: Date): number {
  return Math.floor(date.getTime() / MILLISECONDS_PER_SECOND);
}
