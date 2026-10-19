import { ShieldUserIcon, UserPlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { AccessDenied } from "@/components/access-denied";
import { PageHeader } from "@/components/page-header";
import { TableSkeleton } from "@/components/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireUser } from "@/infra/auth/session";
import { getFacade } from "@/infra/facade";
import { hasPermission } from "@/modules/auth/permissions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("users.list");
  return { title: t("title") };
}

/** TL02 — user list (UC06). */
export default async function UsersPage() {
  const t = await getTranslations("users.list");

  return (
    <>
      <PageHeader breadcrumbs={[{ label: t("title") }]} />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
          <Button render={<Link href="/users/new" />}>
            <UserPlusIcon />
            {t("newUser")}
          </Button>
        </div>
        <Suspense fallback={<TableSkeleton columns={5} />}>
          <UsersTable />
        </Suspense>
      </div>
    </>
  );
}

async function UsersTable() {
  const actor = await requireUser();
  if (!hasPermission(actor.role, "MANAGE_USERS")) return <AccessDenied />;
  const users = await (await getFacade()).listUsers(actor);
  const t = await getTranslations("users");

  if (users.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShieldUserIcon />
          </EmptyMedia>
          <EmptyTitle>{t("list.empty")}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="w-16">{t("list.columns.id")}</TableHead>
            <TableHead>{t("fields.name")}</TableHead>
            <TableHead>{t("fields.email")}</TableHead>
            <TableHead>{t("fields.login")}</TableHead>
            <TableHead>{t("fields.role")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="text-muted-foreground tabular-nums">{user.id}</TableCell>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.login}</TableCell>
              <TableCell>
                <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{t(`roles.${user.role}`)}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
