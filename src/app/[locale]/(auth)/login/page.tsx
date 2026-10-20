import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { FormSkeleton } from "@/components/form-skeleton";
import { getCurrentUser } from "@/infra/auth/session";
import { getFacade } from "@/infra/facade";

import { SignInForm } from "./sign-in-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("signIn");
  return { title: t("title") };
}

export default function SignInPage() {
  return (
    <Suspense fallback={<FormSkeleton fields={2} />}>
      <SignInGate />
    </Suspense>
  );
}

/** RF16: an empty system starts at the first administrator; a signed-in user goes home. */
async function SignInGate() {
  if (await getCurrentUser()) redirect("/");
  if (!(await (await getFacade()).hasUsers())) redirect("/setup");
  return <SignInForm />;
}
