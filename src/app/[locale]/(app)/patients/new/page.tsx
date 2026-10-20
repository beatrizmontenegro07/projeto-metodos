import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { AccessDenied } from "@/components/access-denied";
import { FormSkeleton } from "@/components/form-skeleton";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/infra/auth/session";
import { hasPermission } from "@/modules/auth/permissions";

import { addPatient } from "../actions";
import { PatientForm } from "../patient-form";
import { getPatientOptions } from "../patient-options";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("patients.new");
  return { title: t("title") };
}

/** TL04, empty — patient registration (UC01). */
export default async function NewPatientPage() {
  const t = await getTranslations("patients");

  return (
    <>
      <PageHeader breadcrumbs={[{ label: t("list.title"), href: "/patients" }, { label: t("new.title") }]} />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t("new.title")}</h1>
          <p className="text-muted-foreground">{t("new.description")}</p>
        </div>
        <Suspense fallback={<FormSkeleton fields={8} />}>
          <NewPatientGate />
        </Suspense>
      </div>
    </>
  );
}

async function NewPatientGate() {
  const actor = await requireUser();
  if (!hasPermission(actor.role, "MANAGE_PATIENTS")) return <AccessDenied />;
  const t = await getTranslations("patients.new");
  return <PatientForm action={addPatient} {...await getPatientOptions()} submitLabel={t("submit")} pendingLabel={t("submitting")} />;
}
