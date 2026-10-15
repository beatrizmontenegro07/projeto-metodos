import type messages from "../../messages/en.json";
import type { routing } from "./routing";

// English is the source catalog: t("...") keys are type-checked against messages/en.json.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
