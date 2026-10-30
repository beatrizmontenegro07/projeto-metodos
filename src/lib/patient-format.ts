const CPF_PATTERN = /^(\d{3})(\d{3})(\d{3})(\d{2})$/;
const PHONE_PATTERN = /^(\d{2})(\d{4,5})(\d{4})$/;

/** "12345678909" → "123.456.789-09"; anything else is shown as stored. */
export function formatCpf(digits: string): string {
  return digits.replace(CPF_PATTERN, "$1.$2.$3-$4");
}

/** "83987654321" → "(83) 98765-4321" and "8332221100" → "(83) 3222-1100". */
export function formatPhone(digits: string): string {
  return digits.replace(PHONE_PATTERN, "($1) $2-$3");
}

/**
 * A birth date is a calendar day without time zone; reading it as UTC midnight and formatting it
 * in UTC keeps "1985-03-12" on the 12th in every time zone.
 */
export function birthDateAsUtc(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00Z`);
}
