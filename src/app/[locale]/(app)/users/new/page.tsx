import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { AccessDenied } from "@/components/access-denied";
import { FormSkeleton } from "@/components/form-skeleton";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/infra/auth/session";
import { hasPermission } from "@/modules/auth/permissions";
import { ROLES } from "@/modules/users/role";

import { NewUserForm } from "./new-user-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("users.new");
  return { title: t("title") };
}

/** TL01 — user registration (UC05). */
export default async function NewUserPage() {
  const t = await getTranslations("users");

  return (
    <>
      <PageHeader breadcrumbs={[{ label: t("list.title"), href: "/users" }, { label: t("new.title") }]} />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t("new.title")}</h1>
          <p className="text-muted-foreground">{t("new.description")}</p>
        </div>
        <Suspense fallback={<FormSkeleton fields={5} />}>
          <NewUserGate />
        </Suspense>
      </div>
    </>
  );
}

async function NewUserGate() {
  const actor = await requireUser();
  if (!hasPermission(actor.role, "MANAGE_USERS")) return <AccessDenied />;
  const t = await getTranslations("users.roles");
  return <NewUserForm roles={ROLES.map((role) => ({ value: role, label: t(role) }))} />;
}
