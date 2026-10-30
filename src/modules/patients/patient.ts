import type { Gender } from "./gender";
import type { LegalBasis } from "./legal-basis";

/** What a person types in the patient form; `PatientController` validates and normalizes it. */
export type PatientInput = {
  name: string;
  cpf: string;
  birthDate: string;
  gender: string;
  phone: string;
  email?: string;
  address?: string;
  legalBasis: string;
};

/** Validated patient data: CPF and phone hold digits only, the birth date is `YYYY-MM-DD`. */
export type PatientData = {
  name: string;
  cpf: string;
  birthDate: string;
  gender: Gender;
  phone: string;
  email?: string;
  address?: string;
  legalBasis: LegalBasis;
};

export type Patient = PatientData & {
  id: number;
  active: boolean;
  /** The user who registered the patient. */
  createdBy: number;
};

export const PATIENT_STATUS_FILTERS = ["all", "active", "inactive"] as const;

export type PatientStatusFilter = (typeof PATIENT_STATUS_FILTERS)[number];

export function isPatientStatusFilter(value: unknown): value is PatientStatusFilter {
  return PATIENT_STATUS_FILTERS.includes(value as PatientStatusFilter);
}

export type PatientSearch = {
  /** Part of the name (any case, with or without accents) or part of the CPF. */
  text: string;
  status: PatientStatusFilter;
};
