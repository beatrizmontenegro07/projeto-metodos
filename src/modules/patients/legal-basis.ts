/** LGPD legal bases (art. 7 and 11) that allow a clinic to process a patient's health data (NF-PRI-01). */
export const LEGAL_BASES = ["CONSENT", "HEALTH_PROTECTION", "LEGAL_OBLIGATION", "LIFE_PROTECTION"] as const;

export type LegalBasis = (typeof LEGAL_BASES)[number];

export function isLegalBasis(value: unknown): value is LegalBasis {
  return LEGAL_BASES.includes(value as LegalBasis);
}
