import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";

import { routing } from "./routing";

// Reading the locale from the [locale] root param (instead of headers or cookies)
// keeps every page eligible for static rendering under cacheComponents.
export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    const localeParam = await rootParams.locale();
    if (!hasLocale(routing.locales, localeParam)) notFound();
    locale = localeParam;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
