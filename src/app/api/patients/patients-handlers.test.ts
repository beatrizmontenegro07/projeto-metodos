import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";

import { createTestApi, jsonRequest, type TestApi } from "../api-test-support";

const PATIENTS_URL = "http://localhost/api/patients";

const JOANA = {
  name: "Joana Souza Lima",
  cpf: "123.456.789-09",
  birthDate: "1985-03-12",
  gender: "FEMALE",
  phone: "(83) 98765-4321",
  legalBasis: "HEALTH_PROTECTION",
};

const BRUNO = { ...JOANA, name: "Bruno Lima", cpf: "529.982.247-25", gender: "MALE" };

async function loadHandlers(api: TestApi) {
  const { createPatientsHandlers } = await import("./patients-handlers");
  return createPatientsHandlers(api.context);
}

describe("/api/patients", () => {
  let api: TestApi;
  let handlers: Awaited<ReturnType<typeof loadHandlers>>;

  beforeEach(async () => {
    api = await createTestApi();
    handlers = await loadHandlers(api);
    api.signInAs(api.receptionist);
  });

  async function addPatient(body: unknown) {
    return handlers.add(jsonRequest(PATIENTS_URL, "POST", body));
  }

  it("POST registers an active patient linked to the receptionist and answers 201", async () => {
    const response = await addPatient({ ...JOANA, email: "joana@mail.com" });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      id: 1,
      name: "Joana Souza Lima",
      cpf: "12345678909",
      birthDate: "1985-03-12",
      gender: "FEMALE",
      phone: "83987654321",
      email: "joana@mail.com",
      legalBasis: "HEALTH_PROTECTION",
      active: true,
      createdBy: api.receptionist.id,
    });
  });

  it("answers 400 with the specific code and message of the broken rule", async () => {
    const response = await addPatient({ ...JOANA, cpf: "123.456.789-00" });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: { code: "CPF_INVALID", message: "O CPF informado é inválido." } });
  });

  it("answers 409 when the CPF is already registered", async () => {
    await addPatient(JOANA);

    const response = await addPatient({ ...BRUNO, cpf: "12345678909" });

    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ error: { code: "CPF_ALREADY_REGISTERED" } });
  });

  it("answers 400 INVALID_REQUEST_BODY when a field is not text", async () => {
    const response = await addPatient({ ...JOANA, email: 42 });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: { code: "INVALID_REQUEST_BODY" } });
  });

  describe("GET with search and status", () => {
    beforeEach(async () => {
      await addPatient(JOANA);
      await addPatient(BRUNO);
      await handlers.changeStatus(jsonRequest(`${PATIENTS_URL}/2`, "PATCH", { active: false }), "2");
    });

    async function namesFor(query: string) {
      const response = await handlers.search(new NextRequest(`${PATIENTS_URL}${query}`));
      return (await response.json()).map((patient: { name: string }) => patient.name);
    }

    it("lists every patient in alphabetical order by default", async () => {
      expect(await namesFor("")).toEqual(["Bruno Lima", "Joana Souza Lima"]);
    });

    it("finds by part of the name or of the CPF", async () => {
      expect(await namesFor("?search=JOANA")).toEqual(["Joana Souza Lima"]);
      expect(await namesFor("?search=982.247")).toEqual(["Bruno Lima"]);
    });

    it("filters by status", async () => {
      expect(await namesFor("?status=inactive")).toEqual(["Bruno Lima"]);
    });

    it("answers 400 INVALID_QUERY for an unknown status", async () => {
      const response = await handlers.search(new NextRequest(`${PATIENTS_URL}?status=deleted`));

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: {
          code: "INVALID_QUERY",
          message: "O parâmetro status deve ser um destes valores: all, active, inactive.",
        },
      });
    });
  });

  describe("/api/patients/{id}", () => {
    beforeEach(async () => {
      await addPatient(JOANA);
    });

    it("GET answers the patient", async () => {
      const response = await handlers.get(new NextRequest(`${PATIENTS_URL}/1`), "1");

      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({ id: 1, name: "Joana Souza Lima" });
    });

    it.each(["99", "abc", "0", "1.5"])("GET answers 404 PATIENT_NOT_FOUND for the id %s", async (id) => {
      const response = await handlers.get(new NextRequest(`${PATIENTS_URL}/${id}`), id);

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: { code: "PATIENT_NOT_FOUND", message: "Paciente não encontrado." } });
    });

    it("PUT replaces the data", async () => {
      const response = await handlers.update(
        jsonRequest(`${PATIENTS_URL}/1`, "PUT", { ...JOANA, phone: "(83) 3222-1100" }),
        "1",
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({ phone: "8332221100", active: true });
    });

    it("PATCH inactivates and reactivates the patient", async () => {
      const inactivated = await handlers.changeStatus(jsonRequest(`${PATIENTS_URL}/1`, "PATCH", { active: false }), "1");
      expect(await inactivated.json()).toMatchObject({ active: false });

      const reactivated = await handlers.changeStatus(jsonRequest(`${PATIENTS_URL}/1`, "PATCH", { active: true }), "1");
      expect(await reactivated.json()).toMatchObject({ active: true });
    });

    it("PATCH answers 400 when active is not a boolean", async () => {
      const response = await handlers.changeStatus(jsonRequest(`${PATIENTS_URL}/1`, "PATCH", { active: "no" }), "1");

      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({ error: { code: "INVALID_REQUEST_BODY" } });
    });
  });

  it("answers 403 ACCESS_DENIED to a doctor", async () => {
    api.signInAs(api.doctor);

    const response = await addPatient(JOANA);

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ error: { code: "ACCESS_DENIED" } });
  });

  it("answers 401 UNAUTHENTICATED without a session", async () => {
    api.signInAs(undefined);

    const response = await handlers.search(new NextRequest(PATIENTS_URL));

    expect(response.status).toBe(401);
  });
});
