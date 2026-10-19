import type { Role } from "@/modules/users/role";

/** Least privilege (NF-SEG-02): each permission lists every role that holds it. */
const ROLES_BY_PERMISSION = {
  MANAGE_USERS: ["ADMIN"],
  MANAGE_PATIENTS: ["ADMIN", "RECEPTIONIST"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof ROLES_BY_PERMISSION;

export function hasPermission(role: Role, permission: Permission): boolean {
  return (ROLES_BY_PERMISSION[permission] as readonly Role[]).includes(role);
}
