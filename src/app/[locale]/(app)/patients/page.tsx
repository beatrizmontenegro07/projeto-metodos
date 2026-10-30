import { UserPlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { AccessDenied } from "@/components/access-denied";
import { PageHeader } from "@/components/page-header";
import { TableSkeleton } from "@/components/table-skeleton";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/infra/auth/session";
import { getFacade } from "@/infra/facade";
import { hasPermission } from "@/modules/auth/permissions";
import { isPatientStatusFilter, PATIENT_STATUS_FILTERS } from "@/modules/patients/patient";

import { PatientSearchForm } from "./patient-search-form";
import { PatientsTable } from "./patients-table";

const DEFAULT_STATUS_FILTER = "all";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("patients.list");
  return { title: t("title") };
}

/** TL03 — patient search (UC09). */
export default async function PatientsPage({ searchParams }: PageProps<"/[locale]/patients">) {
  const t = await getTranslations("patients.list");

  return (
    <>
      <PageHeader breadcrumbs={[{ label: t("title") }]} />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
          <Button render={<Link href="/patients/new" />}>
            <UserPlusIcon />
            {t("newPatient")}
          </Button>
        </div>
        <Suspense fallback={<TableSkeleton columns={6} />}>
          <PatientResults searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function PatientResults({ searchParams }: Pick<PageProps<"/[locale]/patients">, "searchParams">) {
  const actor = await requireUser();
  if (!hasPermission(actor.role, "MANAGE_PATIENTS")) return <AccessDenied />;

  const { search, status } = await searchParams;
  const text = typeof search === "string" ? search : "";
  const statusFilter = isPatientStatusFilter(status) ? status : DEFAULT_STATUS_FILTER;
  const patients = await (await getFacade()).searchPatients(actor, { text, status: statusFilter });
  const t = await getTranslations("patients.list.statuses");

  return (
    <>
      <PatientSearchForm
        key={`${text}|${statusFilter}`}
        text={text}
        status={statusFilter}
        statuses={PATIENT_STATUS_FILTERS.map((filter) => ({ value: filter, label: t(filter) }))}
      />
      <PatientsTable patients={patients} />
    </>
  );
}
