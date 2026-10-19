import { describe, expect, it, vi } from "vitest";

import type { FacadeSingletonController } from "@/modules/facade/facade-singleton-controller";
import type { User } from "@/modules/users/user";

import { createTestApi, jsonRequest } from "../../api-test-support";

const FIRST_ADMINISTRATOR_URL = "http://localhost/api/auth/first-administrator";

const DIANA = { name: "Diana Reis", email: "diana@clinicore.com", login: "diana", password: "Secret@123" };

async function loadHandlers(getFacade: () => Promise<FacadeSingletonController>) {
  const startSession = vi.fn<(user: User) => Promise<void>>(async () => undefined);
  const { createFirstAdministratorHandlers } = await import("./first-administrator-handlers");
  return { handlers: createFirstAdministratorHandlers({ getFacade, startSession }), startSession };
}

async function emptySystemFacade() {
  vi.resetModules();
  const { FacadeSingletonController } = await import("@/modules/facade/facade-singleton-controller");
  const { InMemoryUserRepository } = await import("@/infra/users/in-memory-user-repository");
  const { InMemoryPatientRepository } = await import("@/infra/patients/in-memory-patient-repository");
  const facade = await FacadeSingletonController.getInstance(async () => ({
    users: new InMemoryUserRepository(),
    patients: new InMemoryPatientRepository(),
  }));
  return async () => facade;
}

describe("/api/auth/first-administrator", () => {
  it("creates the first administrator of an empty system and opens the session", async () => {
    const { handlers, startSession } = await loadHandlers(await emptySystemFacade());

    const response = await handlers.create(jsonRequest(FIRST_ADMINISTRATOR_URL, "POST", DIANA));

    expect(response.status).toBe(201);
    const administrator = await response.json();
    expect(administrator).toMatchObject({ login: "diana", role: "ADMIN" });
    expect(startSession).toHaveBeenCalledWith(administrator);
  });

  it("answers 400 with the rule that the first administrator broke", async () => {
    const { handlers } = await loadHandlers(await emptySystemFacade());

    const response = await handlers.create(jsonRequest(FIRST_ADMINISTRATOR_URL, "POST", { ...DIANA, login: "diana1" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: { code: "LOGIN_HAS_NUMBERS" } });
  });

  it("answers 409 FIRST_ADMINISTRATOR_EXISTS once a user exists", async () => {
    const api = await createTestApi();
    const { handlers, startSession } = await loadHandlers(api.context.getFacade);

    const response = await handlers.create(jsonRequest(FIRST_ADMINISTRATOR_URL, "POST", DIANA));

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: {
        code: "FIRST_ADMINISTRATOR_EXISTS",
        message: "O primeiro administrador já foi criado. Entre com sua conta.",
      },
    });
    expect(startSession).not.toHaveBeenCalled();
  });
});
