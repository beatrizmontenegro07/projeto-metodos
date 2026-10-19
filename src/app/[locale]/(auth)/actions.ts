"use server";

import { redirect } from "next/navigation";

import { startSession } from "@/infra/auth/session";
import { getFacade } from "@/infra/facade";
import { type FormState, readFields } from "@/lib/form-state";

import { type SignInField, signInFailure, type UserField, userFailure } from "../form-failures";

const SIGN_IN_FIELDS = ["identifier", "password"] as const;
const FIRST_ADMINISTRATOR_FIELDS = ["name", "email", "login", "password"] as const;

/** UC04: opens the session and goes to the home page; the password is never sent back. */
export async function signIn(_previous: FormState<SignInField>, formData: FormData): Promise<FormState<SignInField>> {
  const { identifier, password } = readFields(formData, SIGN_IN_FIELDS);
  try {
    const user = await (await getFacade()).signIn({ identifier, password });
    await startSession(user);
  } catch (error) {
    return { values: { identifier }, ...signInFailure(error) };
  }
  redirect("/");
}

/** RF16: creates the first administrator of an empty system and signs them in. */
export async function createFirstAdministrator(
  _previous: FormState<UserField>,
  formData: FormData,
): Promise<FormState<UserField>> {
  const { password, ...values } = readFields(formData, FIRST_ADMINISTRATOR_FIELDS);
  try {
    const administrator = await (await getFacade()).createFirstAdministrator({ ...values, password });
    await startSession(administrator);
  } catch (error) {
    return { values, ...userFailure(error) };
  }
  redirect("/");
}
