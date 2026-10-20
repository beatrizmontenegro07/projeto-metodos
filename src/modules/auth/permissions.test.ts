import { describe, expect, it } from "vitest";

import type { Role } from "@/modules/users/role";

import { hasPermission, type Permission } from "./permissions";

describe("permissions by role (NF-SEG-02)", () => {
  it.each<[role: Role, permissions: Permission[]]>([
    ["ADMIN", ["MANAGE_USERS", "MANAGE_PATIENTS"]],
    ["RECEPTIONIST", ["MANAGE_PATIENTS"]],
    ["DOCTOR", []],
    ["PATIENT", []],
  ])("%s holds exactly %j", (role, permissions) => {
    const allPermissions: Permission[] = ["MANAGE_USERS", "MANAGE_PATIENTS"];

    expect(allPermissions.filter((permission) => hasPermission(role, permission))).toEqual(permissions);
  });
});
