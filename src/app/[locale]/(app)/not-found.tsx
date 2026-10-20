import { SearchXIcon } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

/** Shown inside the signed-in shell when a page calls notFound(), e.g. for an unknown patient id. */
export default async function NotFound() {
  const t = await getTranslations("notFoundPage");

  return (
    <Empty className="m-6">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon />
        </EmptyMedia>
        <EmptyTitle>{t("title")}</EmptyTitle>
        <EmptyDescription>{t("description")}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button render={<Link href="/" />}>{t("home")}</Button>
      </EmptyContent>
    </Empty>
  );
}
