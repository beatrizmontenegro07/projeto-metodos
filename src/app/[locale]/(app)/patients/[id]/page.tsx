import { CircleCheckIcon } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { AccessDenied } from "@/components/access-denied";
import { FormSkeleton } from "@/components/form-skeleton";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/infra/auth/session";
import { getFacade } from "@/infra/facade";
import { formatCpf, formatPhone } from "@/lib/patient-format";
import { hasPermission } from "@/modules/auth/permissions";
import { PatientNotFoundError } from "@/modules/patients/errors";
import type { Patient } from "@/modules/patients/patient";
import type { User } from "@/modules/users/user";

import { updatePatient } from "../actions";
import { PatientForm } from "../patient-form";
import { getPatientOptions } from "../patient-options";
import { PatientStatusButton } from "../patient-status-button";

const PATIENT_ID = /^[1-9]\d*$/;
const SAVED_MESSAGES = { created: "created", updated: "updated" } as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("patients.edit");
  return { title: t("title") };
}

/** TL04, filled — patient edit (UC07), inactivation and reactivation (UC08). */
export default function PatientPage({ params, searchParams }: PageProps<"/[locale]/patients/[id]">) {
  return (
    <Suspense fallback={<FormSkeleton fields={8} />}>
      <PatientEditor params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function PatientEditor({ params, searchParams }: Pick<PageProps<"/[locale]/patients/[id]">, "params" | "searchParams">) {
  const actor = await requireUser();
  const t = await getTranslations("patients");
  if (!hasPermission(actor.role, "MANAGE_PATIENTS")) return <AccessDenied />;

  const patient = await findPatient(actor, (await params).id);
  const author = await (await getFacade()).findUser(patient.createdBy);
  const saved = SAVED_MESSAGES[(await searchParams).saved as keyof typeof SAVED_MESSAGES];

  return (
    <>
      <PageHeader breadcrumbs={[{ label: t("list.title"), href: "/patients" }, { label: patient.name }]} />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{patient.name}</h1>
              <Badge variant={patient.active ? "secondary" : "outline"}>
                {t(patient.active ? "status.active" : "status.inactive")}
              </Badge>
            </div>
            {author && <p className="text-sm text-muted-foreground">{t("edit.createdBy", { name: author.name })}</p>}
          </div>
          <PatientStatusButton patientId={patient.id} patientName={patient.name} active={patient.active} />
        </div>
        {saved && (
          <Alert className="max-w-3xl">
            <CircleCheckIcon />
            <AlertDescription>{t(`edit.saved.${saved}`)}</AlertDescription>
          </Alert>
        )}
        <PatientForm
          action={updatePatient.bind(null, patient.id)}
          initialValues={toFormValues(patient)}
          {...await getPatientOptions()}
          submitLabel={t("edit.submit")}
          pendingLabel={t("edit.submitting")}
        />
      </div>
    </>
  );
}

async function findPatient(actor: User, id: string): Promise<Patient> {
  if (!PATIENT_ID.test(id)) notFound();
  try {
    return await (await getFacade()).getPatient(actor, Number(id));
  } catch (error) {
    if (error instanceof PatientNotFoundError) notFound();
    throw error;
  }
}

function toFormValues(patient: Patient) {
  return {
    name: patient.name,
    cpf: formatCpf(patient.cpf),
    birthDate: patient.birthDate,
    gender: patient.gender,
    phone: formatPhone(patient.phone),
    email: patient.email ?? "",
    address: patient.address ?? "",
    legalBasis: patient.legalBasis,
  };
}
