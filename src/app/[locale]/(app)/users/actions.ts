"use server";

import { redirect } from "next/navigation";

import { requireUser } from "@/infra/auth/session";
import { getFacade } from "@/infra/facade";
import { type FormState, readFields } from "@/lib/form-state";
import type { Role } from "@/modules/users/role";

import { type UserField, userFailure } from "../../form-failures";

const NEW_USER_FIELDS = ["name", "email", "login", "password", "role"] as const;

/** UC05: the facade checks that the signed-in user may manage users, so the action does not repeat it. */
export async function addUser(_previous: FormState<UserField>, formData: FormData): Promise<FormState<UserField>> {
  const actor = await requireUser();
  const { password, ...values } = readFields(formData, NEW_USER_FIELDS);
  try {
    // Any text may arrive as the role; the domain rejects unknown ones with INVALID_ROLE.
    await (await getFacade()).addUser(actor, { ...values, password, role: values.role as Role });
  } catch (error) {
    return { values, ...userFailure(error) };
  }
  redirect("/users");
}
