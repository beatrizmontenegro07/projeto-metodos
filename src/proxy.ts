import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

import { routing } from "./i18n/routing";
import { readSessionSecret, readSessionToken, SESSION_COOKIE } from "./infra/auth/session-token";

const handleLocale = createMiddleware(routing);

const SIGN_IN_PATH = "/login";
// The sign-in pages, and the language switch links (/en, /pt-BR), which only store the choice.
const PUBLIC_PATHS = new Set([SIGN_IN_PATH, "/setup", ...routing.locales.map((locale) => `/${locale}`)]);

/**
 * Picks the locale and rewrites to app/[locale]. Pages other than sign-in need a session: this
 * only checks the cookie signature (optimistic, NF-SEG-02); every page, Server Action and API
 * route still checks the signed-in user through the facade.
 */
export default async function proxy(request: NextRequest) {
  if (!PUBLIC_PATHS.has(request.nextUrl.pathname) && !(await hasSessionCookie(request))) {
    return NextResponse.redirect(new URL(SIGN_IN_PATH, request.url));
  }
  return handleLocale(request);
}

async function hasSessionCookie(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return (await readSessionToken(token, readSessionSecret(process.env.SESSION_SECRET))) !== undefined;
}

export const config = {
  // Pages are rewritten to app/[locale]; API routes, Next internals, and static files are not.
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
