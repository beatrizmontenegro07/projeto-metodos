import type { Locale } from "./routing";

export async function loadMessages(locale: Locale) {
  return (await import(`../../messages/${locale}.json`)).default;
}
