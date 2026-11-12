import type { AccessRecord, AccessRecordRepository } from "@/modules/access-records/access-record-repository";
import { InvalidReportEndError, InvalidReportFormatError, InvalidReportPeriodError, InvalidReportStartError } from "./errors";

export type ReportInput = { start: string; end: string; format: string };
export type ReportLabels = { title: string; period: string; userId: string; count: string; lastAccess: string; total: string };
export type ReportFile = { content: string; mediaType: string; extension: "html" | "csv" };
type UserStatistics = { userId: number; count: number; lastAccess: string };
type Statistics = { rows: UserStatistics[]; total: number; start: string; end: string };

function timestamp(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)?$/.test(value)) return NaN;
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value.slice(0, 10) ? time : NaN;
}

/** Template Method: subclasses specialize rendering while sharing the complete generation flow. */
export abstract class AccessReportTemplate {
  constructor(private readonly repository: AccessRecordRepository) {}

  async generate(input: Pick<ReportInput, "start" | "end">, labels: ReportLabels): Promise<ReportFile> {
    const start = timestamp(input.start);
    const end = timestamp(input.end);
    if (!Number.isFinite(start)) throw new InvalidReportStartError();
    if (!Number.isFinite(end)) throw new InvalidReportEndError();
    if (start >= end) throw new InvalidReportPeriodError();
    const records = (await this.repository.list()).filter((record) => {
      const time = Date.parse(record.occurredAt);
      return time >= start && time < end;
    });
    return this.render({ ...this.aggregate(records), start: new Date(start).toISOString(), end: new Date(end).toISOString() }, labels);
  }

  private aggregate(records: AccessRecord[]): Pick<Statistics, "rows" | "total"> {
    const users = new Map<number, UserStatistics>();
    for (const record of records) {
      const row = users.get(record.userId) ?? { userId: record.userId, count: 0, lastAccess: record.occurredAt };
      row.count++;
      if (Date.parse(record.occurredAt) > Date.parse(row.lastAccess)) row.lastAccess = record.occurredAt;
      users.set(record.userId, row);
    }
    return { rows: [...users.values()].sort((a, b) => a.userId - b.userId), total: records.length };
  }

  protected abstract render(statistics: Statistics, labels: ReportLabels): ReportFile;
}

function escapeHtml(value: string): string {
  const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return value.replace(/[&<>"']/g, (character) => entities[character]);
}

export class HtmlAccessReport extends AccessReportTemplate {
  protected render(data: Statistics, labels: ReportLabels): ReportFile {
    const headers = [labels.userId, labels.count, labels.lastAccess].map((label) => `<th scope="col">${escapeHtml(label)}</th>`).join("");
    const rows = data.rows.map((row) => `<tr><td>${row.userId}</td><td>${row.count}</td><td>${escapeHtml(row.lastAccess)}</td></tr>`).join("");
    return {
      extension: "html", mediaType: "text/html; charset=utf-8",
      content: `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(labels.title)}</title></head><body><h1>${escapeHtml(labels.title)}</h1><p>${escapeHtml(labels.period)}: ${data.start} — ${data.end}</p><p>${escapeHtml(labels.total)}: ${data.total}</p><table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></body></html>`,
    };
  }
}

export class CsvAccessReport extends AccessReportTemplate {
  protected render(data: Statistics, labels: ReportLabels): ReportFile {
    const rows = [
      [labels.userId, labels.count, labels.lastAccess],
      ...data.rows.map((row) => [row.userId, row.count, row.lastAccess]),
      [labels.total, data.total, ""],
    ];
    return { extension: "csv", mediaType: "text/csv; charset=utf-8", content: rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n") };
  }
}

export function createAccessReport(repository: AccessRecordRepository, input: ReportInput, labels: ReportLabels): Promise<ReportFile> {
  if (input.format === "html") return new HtmlAccessReport(repository).generate(input, labels);
  if (input.format === "csv") return new CsvAccessReport(repository).generate(input, labels);
  return Promise.reject(new InvalidReportFormatError());
}
