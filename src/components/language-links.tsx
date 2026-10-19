import { getLocale, getTranslations } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/** Links to /<locale>: the proxy stores the choice in the NEXT_LOCALE cookie and goes back home. */
export async function LanguageLinks() {
  const t = await getTranslations("common.languages");
  const currentLocale = await getLocale();

  return (
    <nav className="flex justify-center gap-4 text-sm text-muted-foreground">
      {routing.locales.map((locale) => (
        <a
          key={locale}
          href={`/${locale}`}
          lang={locale}
          aria-current={locale === currentLocale ? "true" : undefined}
          className={cn("underline-offset-4 hover:underline", locale === currentLocale && "font-medium text-foreground")}
        >
          {t(locale)}
        </a>
      ))}
    </nav>
  );
}
