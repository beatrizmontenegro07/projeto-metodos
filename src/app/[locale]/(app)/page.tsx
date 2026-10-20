import { ShieldUserIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/infra/auth/session";
import { getFacade } from "@/infra/facade";
import { hasPermission } from "@/modules/auth/permissions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return { title: t("title") };
}

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <>
      <PageHeader breadcrumbs={[{ label: t("title") }]} />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <Suspense fallback={<TotalsSkeleton />}>
          <Dashboard />
        </Suspense>
      </div>
    </>
  );
}

/** RF15: the totals of the areas the user can open, and shortcuts to their most common tasks. */
async function Dashboard() {
  const user = await requireUser();
  const totals = await (await getFacade()).countRegisteredEntities(user);
  const t = await getTranslations("home");
  const format = await getFormatter();
  const canManagePatients = hasPermission(user.role, "MANAGE_PATIENTS");
  const canManageUsers = hasPermission(user.role, "MANAGE_USERS");

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t("greeting", { name: user.name })}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      {totals.users === undefined && totals.patients === undefined ? (
        <p className="text-muted-foreground">{t("noTotals")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {totals.patients !== undefined && (
            <TotalCard
              label={t("totals.patients")}
              value={format.number(totals.patients)}
              footer={t("totals.patientsFooter")}
              icon={<UsersIcon />}
            />
          )}
          {totals.users !== undefined && (
            <TotalCard
              label={t("totals.users")}
              value={format.number(totals.users)}
              footer={t("totals.usersFooter")}
              icon={<ShieldUserIcon />}
            />
          )}
        </div>
      )}
      {(canManagePatients || canManageUsers) && (
        <div className="flex flex-wrap gap-2">
          {canManagePatients && (
            <Button render={<Link href="/patients/new" />}>
              <UserPlusIcon />
              {t("shortcuts.newPatient")}
            </Button>
          )}
          {canManageUsers && (
            <Button variant="outline" render={<Link href="/users/new" />}>
              <ShieldUserIcon />
              {t("shortcuts.newUser")}
            </Button>
          )}
        </div>
      )}
    </>
  );
}

/** The section-cards style of the shadcn/ui dashboard-01 block. */
function TotalCard({ label, value, footer, icon }: { label: string; value: string; footer: string; icon: React.ReactNode }) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">{value}</CardTitle>
        <CardAction className="text-muted-foreground [&_svg]:size-5">{icon}</CardAction>
      </CardHeader>
      <CardFooter className="text-sm text-muted-foreground">{footer}</CardFooter>
    </Card>
  );
}

function TotalsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden>
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}
