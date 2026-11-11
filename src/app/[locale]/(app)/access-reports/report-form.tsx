"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { OptionSelect } from "@/components/option-select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function AccessReportForm() {
  const t = useTranslations("reports");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function download(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const format = String(values.get("format"));
    const query = new URLSearchParams({ start: String(values.get("start")), end: String(values.get("end")), format });
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/access-reports?${query}`, { cache: "no-store" });
      if (!response.ok) {
        const failure = await response.json();
        setError(failure.error?.message ?? t("errors.DOWNLOAD_FAILED"));
        return;
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `access-report.${format}`;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch {
      setError(t("errors.DOWNLOAD_FAILED"));
    } finally {
      setBusy(false);
    }
  }
  return <form onSubmit={download} className="flex flex-col gap-4">
    <Field><FieldLabel htmlFor="start">{t("start")}</FieldLabel><Input id="start" name="start" type="date" required /></Field>
    <Field><FieldLabel htmlFor="end">{t("end")}</FieldLabel><Input id="end" name="end" type="date" required /></Field>
    <Field><FieldLabel htmlFor="format">{t("format")}</FieldLabel><OptionSelect id="format" name="format" required defaultValue="html" placeholder={t("format")} options={[{ value: "html", label: t("html") }, { value: "csv", label: t("csv") }]} /></Field>
    {error && <Alert variant="destructive" role="alert"><AlertDescription>{error}</AlertDescription></Alert>}
    <Button type="submit" disabled={busy}>{t(busy ? "downloading" : "download")}</Button>
  </form>;
}
