export const ROLES = ["ADMIN", "RECEPTIONIST", "DOCTOR", "PATIENT"] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return ROLES.includes(value as Role);
}
