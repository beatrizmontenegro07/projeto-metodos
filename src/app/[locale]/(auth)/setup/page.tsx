import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { FormSkeleton } from "@/components/form-skeleton";
import { getCurrentUser } from "@/infra/auth/session";
import { getFacade } from "@/infra/facade";

import { FirstAdministratorForm } from "./first-administrator-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("setup");
  return { title: t("title") };
}

export default function SetupPage() {
  return (
    <Suspense fallback={<FormSkeleton fields={4} />}>
      <SetupGate />
    </Suspense>
  );
}

/** RF16: the first administrator can be created only while no user exists. */
async function SetupGate() {
  if (await getCurrentUser()) redirect("/");
  if (await (await getFacade()).hasUsers()) redirect("/login");
  return <FirstAdministratorForm />;
}
