import { describe, expect, it, vi } from "vitest";

import { InMemoryAccessRecordRepository } from "@/infra/access-records/in-memory-access-record-repository";
import { createAccessReport, type ReportLabels } from "./access-report";

const labels: ReportLabels = { title: "Access report", period: "Period", userId: "User ID", count: "Count", lastAccess: "Last access", total: "Total" };
const period = { start: "2026-11-01", end: "2026-11-02" };

describe("access report template method", () => {
  it.each(["html", "csv"])("filters, aggregates and renders %s with stable user ordering", async (format) => {
    const repository = new InMemoryAccessRecordRepository();
    for (const [userId, occurredAt] of [
      [2, "2026-11-01T15:00:00.000Z"], [1, "2026-11-01T00:00:00.000Z"],
      [2, "2026-11-01T10:00:00.000Z"], [2, "2026-11-01T15:00:00.000Z"],
      [9, "2026-11-02T00:00:00.000Z"], [9, "2026-10-31T23:59:59.999Z"],
    ] as const) await repository.add({ userId, occurredAt });
    const report = await createAccessReport(repository, { ...period, format }, labels);
    if (format === "csv") {
      expect(report.content).toBe('"User ID","Count","Last access"\r\n"1","1","2026-11-01T00:00:00.000Z"\r\n"2","3","2026-11-01T15:00:00.000Z"\r\n"Total","4",""');
    } else {
      expect(report.content).toContain('<tr><td>1</td><td>1</td><td>2026-11-01T00:00:00.000Z</td></tr>');
      expect(report.content).toContain('<tr><td>2</td><td>3</td><td>2026-11-01T15:00:00.000Z</td></tr>');
      expect(report.content).toContain('Total: 4');
      expect(report.content).not.toContain('<td>9</td>');
    }
    expect(report.extension).toBe(format);
  });

  it.each(["html", "csv"])("renders a zero total without user rows in empty %s", async (format) => {
    const report = await createAccessReport(new InMemoryAccessRecordRepository(), { ...period, format }, labels);
    expect(report.content).toContain(format === "csv" ? '"Total","0",""' : 'Total: 0');
    if (format === "html") expect(report.content).toContain('<tbody></tbody>');
  });

  it.each([
    [{ start: "2026-02-30" }, "REPORT_START_INVALID"],
    [{ start: "" }, "REPORT_START_INVALID"],
    [{ end: "invalid" }, "REPORT_END_INVALID"],
    [{ end: "2026-11-01" }, "REPORT_PERIOD_NOT_INCREASING"],
    [{ end: "2026-10-01" }, "REPORT_PERIOD_NOT_INCREASING"],
    [{ format: "pdf" }, "REPORT_FORMAT_INVALID"],
  ])("rejects invalid input %j without reading storage", async (overrides, code) => {
    const repository = new InMemoryAccessRecordRepository();
    const list = vi.spyOn(repository, "list");
    await expect(createAccessReport(repository, { ...period, format: "html", ...overrides }, labels)).rejects.toMatchObject({ code });
    expect(list).not.toHaveBeenCalled();
  });

  it("escapes HTML and CSV labels", async () => {
    const repository = new InMemoryAccessRecordRepository();
    const custom = { ...labels, title: '<script>"&', userId: 'User,"ID"' };
    const html = await createAccessReport(repository, { ...period, format: "html" }, custom);
    expect(html.content).toContain('&lt;script&gt;&quot;&amp;');
    expect(html.content).not.toContain('<script>');
    const csv = await createAccessReport(repository, { ...period, format: "csv" }, custom);
    expect(csv.content).toContain('"User,""ID"""');
  });

  it("propagates storage failure instead of producing an empty report", async () => {
    const repository = new InMemoryAccessRecordRepository();
    vi.spyOn(repository, "list").mockRejectedValueOnce(new Error("offline"));
    await expect(createAccessReport(repository, { ...period, format: "csv" }, labels)).rejects.toThrow("offline");
  });
});
