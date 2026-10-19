"use server";

import { redirect } from "next/navigation";

import { endSession } from "@/infra/auth/session";

/** RF06: ends the session and shows the sign-in page. */
export async function signOut(): Promise<void> {
  await endSession();
  redirect("/login");
}
