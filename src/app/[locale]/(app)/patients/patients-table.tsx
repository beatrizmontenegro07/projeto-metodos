"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDownIcon, PencilIcon, SearchXIcon } from "lucide-react";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { birthDateAsUtc, formatCpf, formatPhone } from "@/lib/patient-format";
import type { Patient } from "@/modules/patients/patient";

import { PatientStatusButton } from "./patient-status-button";

const PAGE_SIZE = 10;

/** TL03 — the data-table pattern of shadcn/ui: sorting and paging on the rows the server found (RF14). */
export function PatientsTable({ patients }: { patients: Patient[] }) {
  const t = useTranslations("patients");
  const format = useFormatter();
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<Patient>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" className="-ml-2" onClick={() => column.toggleSorting()}>
            {t("fields.name")}
            <ArrowUpDownIcon />
          </Button>
        ),
        cell: ({ row }) => (
          <Link href={`/patients/${row.original.id}`} className="font-medium underline-offset-4 hover:underline">
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: "cpf", header: t("fields.cpf"), cell: ({ row }) => formatCpf(row.original.cpf) },
      { accessorKey: "phone", header: t("fields.phone"), cell: ({ row }) => formatPhone(row.original.phone) },
      {
        accessorKey: "birthDate",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" className="-ml-2" onClick={() => column.toggleSorting()}>
            {t("fields.birthDate")}
            <ArrowUpDownIcon />
          </Button>
        ),
        cell: ({ row }) =>
          format.dateTime(birthDateAsUtc(row.original.birthDate), { dateStyle: "short", timeZone: "UTC" }),
      },
      {
        accessorKey: "active",
        header: t("list.columns.status"),
        cell: ({ row }) => (
          <Badge variant={row.original.active ? "secondary" : "outline"}>
            {t(row.original.active ? "status.active" : "status.inactive")}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">{t("list.columns.actions")}</span>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" render={<Link href={`/patients/${row.original.id}`} />}>
              <PencilIcon />
              {t("list.edit")}
            </Button>
            <PatientStatusButton
              patientId={row.original.id}
              patientName={row.original.name}
              active={row.original.active}
              size="sm"
            />
          </div>
        ),
      },
    ],
    [t, format],
  );

  // TanStack Table returns new functions on every render, so the React Compiler skips this component.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: patients,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: PAGE_SIZE } },
  });

  if (patients.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle>{t("list.empty")}</EmptyTitle>
          <EmptyDescription>{t("list.emptyDescription")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const { pageIndex } = table.getState().pagination;

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>{t("list.showing", { shown: table.getRowModel().rows.length, total: patients.length })}</span>
        <div className="flex items-center gap-2">
          <span>{t("list.page", { page: pageIndex + 1, pages: table.getPageCount() })}</span>
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            {t("list.previous")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            {t("list.next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
