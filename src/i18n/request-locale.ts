import { hasLocale } from "next-intl";
import type { NextRequest } from "next/server";

import { type Locale, routing } from "./routing";

const LOCALE_COOKIE = "NEXT_LOCALE";

/**
 * API routes run outside the proxy and the [locale] segment, so they pick the language
 * themselves, in the same order as the proxy: the saved cookie, the browser language, pt-BR.
 */
export function resolveRequestLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (hasLocale(routing.locales, cookieLocale)) return cookieLocale;
  return findBrowserLocale(request.headers.get("accept-language")) ?? routing.defaultLocale;
}

function findBrowserLocale(acceptLanguage: string | null): Locale | undefined {
  const browserLanguages = (acceptLanguage ?? "")
    .split(",")
    .map((entry) => entry.split(";")[0].trim().toLowerCase())
    .filter(Boolean);
  for (const browserLanguage of browserLanguages) {
    const locale = routing.locales.find((candidate) => isSameLanguage(candidate, browserLanguage));
    if (locale) return locale;
  }
  return undefined;
}

function isSameLanguage(locale: Locale, browserLanguage: string): boolean {
  const supported = locale.toLowerCase();
  return supported === browserLanguage || supported.split("-")[0] === browserLanguage.split("-")[0];
}
