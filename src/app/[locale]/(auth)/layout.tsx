import { getTranslations } from "next-intl/server";
import { HeartPulseIcon } from "lucide-react";

import { LanguageLinks } from "@/components/language-links";
import { Card, CardContent } from "@/components/ui/card";

/** The two-column sign-in card of the shadcn/ui login-04 block: the form and the CliniCore panel. */
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("authPanel");

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6 md:max-w-4xl">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="p-6 md:p-8">{children}</div>
            <div className="hidden flex-col justify-between gap-8 bg-primary p-8 text-primary-foreground md:flex">
              <div className="flex items-center gap-2 font-semibold">
                <HeartPulseIcon className="size-5" />
                CliniCore
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-2xl font-semibold text-balance">{t("tagline")}</p>
                <p className="text-sm text-balance opacity-80">{t("description")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <LanguageLinks />
      </div>
    </main>
  );
}
