import "server-only";

import { getTranslations } from "next-intl/server";

import type { SelectOption } from "@/components/option-select";
import { GENDERS } from "@/modules/patients/gender";
import { LEGAL_BASES } from "@/modules/patients/legal-basis";

/** The coded choices of the patient form (FHIR gender, LGPD legal basis) with translated labels. */
export async function getPatientOptions(): Promise<{ genders: SelectOption[]; legalBases: SelectOption[] }> {
  const t = await getTranslations("patients");
  return {
    genders: GENDERS.map((gender) => ({ value: gender, label: t(`genders.${gender}`) })),
    legalBases: LEGAL_BASES.map((legalBasis) => ({ value: legalBasis, label: t(`legalBases.${legalBasis}`) })),
  };
}
