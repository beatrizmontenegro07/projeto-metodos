import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { createTestApi } from "../api-test-support";

const request = (format = "csv", start = "2000-01-01", language = "en") => new NextRequest(
  `http://localhost/api/access-reports?start=${start}&end=2100-01-01&format=${format}`,
  { headers: { "accept-language": language } },
);

async function setup() {
  const api = await createTestApi();
  await (await api.context.getFacade()).signIn({ identifier: "carla", password: "Secret@123" });
  const { createAccessReportsHandler } = await import("./access-reports-handlers");
  return { api, download: createAccessReportsHandler(api.context) };
}

describe("access report downloads", () => {
  it.each(["html", "csv"])("downloads %s for an administrator using persisted accesses", async (format) => {
    const { api, download } = await setup();
    api.signInAs(api.admin);
    const response = await download(request(format));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-disposition")).toBe(`attachment; filename="access-report.${format}"`);
    expect(response.headers.get("content-type")).toContain(format === "html" ? "text/html" : "text/csv");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(await response.text()).toContain(format === "html" ? "Total accesses: 1" : '"Total accesses","1",""');
  });

  it("answers 401 without a session and 403 for every other role", async () => {
    const { api, download } = await setup();
    expect((await download(request())).status).toBe(401);
    for (const actor of [api.receptionist, api.doctor, { ...api.admin, role: "PATIENT" as const }]) {
      api.signInAs(actor);
      expect((await download(request())).status).toBe(403);
    }
  });

  it("returns localized JSON validation errors", async () => {
    const { api, download } = await setup();
    api.signInAs(api.admin);
    const response = await download(request("csv", "invalid", "pt-BR"));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: { code: "REPORT_START_INVALID", message: "Informe uma data inicial válida em UTC." } });
    const invalidFormat = await download(request("pdf"));
    expect(invalidFormat.status).toBe(400);
    expect(await invalidFormat.json()).toMatchObject({ error: { code: "REPORT_FORMAT_INVALID" } });
  });

  it("returns 503 when records cannot be read instead of downloading a misleading empty file", async () => {
    const api = await createTestApi(({ InMemoryUserRepository, InMemoryPatientRepository, InMemoryAccessRecordRepository, accessErrors }) => {
      class FailingRecords extends InMemoryAccessRecordRepository {
        override async list(): Promise<never> { throw new accessErrors.AccessRecordPersistenceError("offline"); }
      }
      return { users: new InMemoryUserRepository(), patients: new InMemoryPatientRepository(), accesses: new FailingRecords() };
    });
    api.signInAs(api.admin);
    const { createAccessReportsHandler } = await import("./access-reports-handlers");
    const response = await createAccessReportsHandler(api.context)(request());
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: { code: "STORAGE_UNAVAILABLE" } });
  });
});
