/** HL7 FHIR R4 AdministrativeGender, so a patient maps to a FHIR `Patient.gender` without translation. */
export const GENDERS = ["MALE", "FEMALE", "OTHER", "UNKNOWN"] as const;

export type Gender = (typeof GENDERS)[number];

export function isGender(value: unknown): value is Gender {
  return GENDERS.includes(value as Gender);
}
