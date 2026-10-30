import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection, type NextRequest } from "next/server";
import { cache } from "react";

import { getFacade } from "@/infra/facade";
import type { User } from "@/modules/users/user";

import { createSessionToken, readSessionSecret, readSessionToken, SESSION_COOKIE } from "./session-token";

function sessionSecret(): Uint8Array {
  return readSessionSecret(process.env.SESSION_SECRET);
}

/** Opens the session of `user`; call only from a Server Action or a route handler. */
export async function startSession(user: User): Promise<void> {
  const { token, expiresAt } = await createSessionToken({ userId: user.id, login: user.login }, sessionSecret());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/**
 * The user a session token belongs to, read again from storage so a role change applies at once.
 * The login must match too: with STORAGE=memory, ids restart at 1 on every run, so a token from
 * an earlier run could otherwise point to a different person.
 */
export async function findSessionUser(token: string | undefined): Promise<User | undefined> {
  const claims = await readSessionToken(token, sessionSecret());
  if (!claims) return undefined;
  const user = await (await getFacade()).findUser(claims.userId);
  return user?.login === claims.login ? user : undefined;
}

/** The signed-in user of the current page or Server Action, read once per render. */
export const getCurrentUser = cache(async (): Promise<User | undefined> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  // Checking the expiry reads the clock, so it waits for the real request instead of a prefetch.
  await connection();
  return findSessionUser(token);
});

/** The signed-in user of a page or Server Action; without a session, goes to the sign-in page. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** The signed-in user of an API request. */
export function getRequestUser(request: NextRequest): Promise<User | undefined> {
  return findSessionUser(request.cookies.get(SESSION_COOKIE)?.value);
}
