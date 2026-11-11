import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { AccessDenied } from "@/components/access-denied";
import { PageHeader } from "@/components/page-header";
import { FormSkeleton } from "@/components/form-skeleton";
import { requireUser } from "@/infra/auth/session";
import { hasPermission } from "@/modules/auth/permissions";
import { AccessReportForm } from "./report-form";

export async function generateMetadata() {
  return { title: (await getTranslations("reports"))("title") };
}

export default async function AccessReportsPage() {
  const t = await getTranslations("reports");
  return <>
    <PageHeader breadcrumbs={[{ label: t("title") }]} />
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <Suspense fallback={<FormSkeleton fields={3} />}><ReportContent /></Suspense>
    </div>
  </>;
}

async function ReportContent() {
  const actor = await requireUser();
  if (!hasPermission(actor.role, "GENERATE_ACCESS_REPORTS")) return <AccessDenied />;
  const t = await getTranslations("reports");
  return <div className="flex max-w-xl flex-col gap-4">
    <h1 className="text-2xl font-semibold">{t("title")}</h1>
    <p className="text-muted-foreground">{t("description")}</p>
    <AccessReportForm />
  </div>;
}
