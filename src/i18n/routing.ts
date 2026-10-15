import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt-BR", "en"],
  defaultLocale: "pt-BR",
  // URLs carry no locale (/login, not /pt-BR/login). The proxy rewrites each request
  // internally to app/[locale], picking the locale from the NEXT_LOCALE cookie or the
  // browser language, so pages stay statically prerendered per locale.
  localePrefix: "never",
});

export type Locale = (typeof routing.locales)[number];
