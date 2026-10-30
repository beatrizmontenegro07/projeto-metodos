"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/infra/auth/session";
import { getFacade } from "@/infra/facade";
import { type FormError, type FormState, readFields } from "@/lib/form-state";
import { DuplicatePatientError } from "@/modules/patients/errors";
import { onlyDigits } from "@/modules/patients/rules";
import type { User } from "@/modules/users/user";

import { type PatientField, patientFailure } from "../../form-failures";

const PATIENT_FIELDS = ["name", "cpf", "birthDate", "gender", "phone", "email", "address", "legalBasis"] as const;

export type PatientFormState = FormState<PatientField> & {
  /** UC01 FE2: the patient who already has the CPF, so the form can link to them. */
  existingPatientId?: number;
};

/** UC01: registers the patient as the signed-in user and opens the new record. */
export async function addPatient(_previous: PatientFormState, formData: FormData): Promise<PatientFormState> {
  const actor = await requireUser();
  const values = readFields(formData, PATIENT_FIELDS);
  let patientId: number;
  try {
    patientId = (await (await getFacade()).addPatient(actor, values)).id;
  } catch (error) {
    return { values, ...patientFailure(error), existingPatientId: await findCpfOwner(actor, error, values.cpf) };
  }
  redirect(`/patients/${patientId}?saved=created`);
}

/** UC07: replaces the patient's data; bound to the patient id by the form. */
export async function updatePatient(
  patientId: number,
  _previous: PatientFormState,
  formData: FormData,
): Promise<PatientFormState> {
  const actor = await requireUser();
  const values = readFields(formData, PATIENT_FIELDS);
  try {
    await (await getFacade()).updatePatient(actor, patientId, values);
  } catch (error) {
    return { values, ...patientFailure(error), existingPatientId: await findCpfOwner(actor, error, values.cpf) };
  }
  redirect(`/patients/${patientId}?saved=updated`);
}

/** UC08: inactivates or reactivates the patient and refreshes the screen that asked. */
export async function setPatientActive(patientId: number, active: boolean): Promise<{ error?: FormError }> {
  const actor = await requireUser();
  const facade = await getFacade();
  try {
    if (active) await facade.reactivatePatient(actor, patientId);
    else await facade.deactivatePatient(actor, patientId);
  } catch (error) {
    return { error: patientFailure(error).error };
  }
  refresh();
  return {};
}

async function findCpfOwner(actor: User, error: unknown, cpf: string): Promise<number | undefined> {
  if (!(error instanceof DuplicatePatientError)) return undefined;
  const matches = await (await getFacade()).searchPatients(actor, { text: cpf, status: "all" });
  return matches.find((patient) => patient.cpf === onlyDigits(cpf))?.id;
}
