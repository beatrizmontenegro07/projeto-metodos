import { ShieldAlertIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

/** NF-SEG-02: what a page shows, instead of its data, to a role without permission. */
export async function AccessDenied() {
  const t = await getTranslations("accessDenied");

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShieldAlertIcon />
        </EmptyMedia>
        <EmptyTitle>{t("title")}</EmptyTitle>
        <EmptyDescription>{t("description")}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
