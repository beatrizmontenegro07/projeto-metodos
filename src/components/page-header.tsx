import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { routing } from "@/i18n/routing";

import { LanguageMenu } from "./language-menu";

export type BreadcrumbEntry = { label: string; href?: string };

/** The top bar of every signed-in page: sidebar toggle, where the user is, and the language. */
export async function PageHeader({ breadcrumbs }: { breadcrumbs: BreadcrumbEntry[] }) {
  const t = await getTranslations("common");
  const languages = await getTranslations("common.languages");
  const currentLocale = await getLocale();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" aria-label={t("toggleSidebar")} />
      <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map(({ label, href }, index) => (
            <Fragment key={label}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {href ? (
                  <BreadcrumbLink render={<Link href={href} />}>{label}</BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto">
        <LanguageMenu
          label={t("language")}
          currentLocale={currentLocale}
          options={routing.locales.map((locale) => ({ locale, label: languages(locale) }))}
        />
      </div>
    </header>
  );
}
