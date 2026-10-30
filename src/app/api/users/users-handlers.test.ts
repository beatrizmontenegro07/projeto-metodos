import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";

import { createTestApi, jsonRequest, type TestApi } from "../api-test-support";

const USERS_URL = "http://localhost/api/users";

const BIA = {
  name: "Bia Rocha",
  email: "bia@clinicore.com",
  login: "bia",
  password: "Secret@123",
  role: "RECEPTIONIST",
};

function getRequest() {
  return new NextRequest(USERS_URL);
}

function postRequest(body: unknown, headers: Record<string, string> = {}) {
  return jsonRequest(USERS_URL, "POST", body, headers);
}

async function loadHandlers(api: TestApi) {
  const { createUsersHandlers } = await import("./users-handlers");
  return createUsersHandlers(api.context);
}

describe("/api/users", () => {
  let api: TestApi;
  let handlers: Awaited<ReturnType<typeof loadHandlers>>;

  beforeEach(async () => {
    api = await createTestApi();
    handlers = await loadHandlers(api);
    api.signInAs(api.admin);
  });

  it("POST adds a user through the facade and answers 201 without the password", async () => {
    const response = await handlers.add(postRequest(BIA));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      id: 4,
      name: "Bia Rocha",
      email: "bia@clinicore.com",
      login: "bia",
      role: "RECEPTIONIST",
    });
  });

  it("GET lists the registered users in registration order", async () => {
    const response = await handlers.list(getRequest());

    expect(response.status).toBe(200);
    expect((await response.json()).map((user: { login: string }) => user.login)).toEqual(["carla", "ana", "bruno"]);
  });

  it("answers 401 UNAUTHENTICATED without a session", async () => {
    api.signInAs(undefined);

    const response = await handlers.list(getRequest());

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: { code: "UNAUTHENTICATED", message: "Entre no sistema para continuar." },
    });
  });

  it("answers 403 ACCESS_DENIED to a receptionist without adding the user", async () => {
    api.signInAs(api.receptionist);

    const response = await handlers.add(postRequest(BIA));

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ error: { code: "ACCESS_DENIED" } });
    api.signInAs(api.admin);
    expect(await (await handlers.list(getRequest())).json()).toHaveLength(3);
  });

  it("answers 400 with the specific code and the pt-BR message by default", async () => {
    const response = await handlers.add(postRequest({ ...BIA, login: "bia1" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: { code: "LOGIN_HAS_NUMBERS", message: "O login não pode conter números." },
    });
  });

  it("answers in English when the browser prefers it", async () => {
    const response = await handlers.add(postRequest({ ...BIA, password: "Secret1" }, { "accept-language": "en-US" }));

    expect(await response.json()).toEqual({
      error: { code: "PASSWORD_TOO_SHORT", message: "The password must have at least 8 characters." },
    });
  });

  it("answers in the language saved in the NEXT_LOCALE cookie before the browser language", async () => {
    const response = await handlers.add(
      postRequest({ ...BIA, login: "" }, { cookie: "NEXT_LOCALE=en", "accept-language": "pt-BR" }),
    );

    expect(await response.json()).toEqual({ error: { code: "LOGIN_EMPTY", message: "Enter a login." } });
  });

  it("answers 409 when the e-mail is already registered", async () => {
    const response = await handlers.add(postRequest({ ...BIA, email: "ana@clinicore.com" }));

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: { code: "EMAIL_ALREADY_REGISTERED", message: "Já existe um usuário cadastrado com este e-mail." },
    });
  });

  it.each([
    ["not JSON", "{name:"],
    ["not an object", "[]"],
    ["missing the e-mail", JSON.stringify({ ...BIA, email: undefined })],
  ])("answers 400 INVALID_REQUEST_BODY naming the fields when the body is %s", async (_case, body) => {
    const response = await handlers.add(postRequest(body));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: {
        code: "INVALID_REQUEST_BODY",
        message: "O corpo da requisição deve ser um JSON com estes campos em texto: name, email, login, password, role.",
      },
    });
  });
});

describe("/api/users when the storage fails", () => {
  it("answers 503 STORAGE_UNAVAILABLE", async () => {
    const api = await createTestApi(({ InMemoryUserRepository, InMemoryPatientRepository, userErrors }) => {
      class FailingUserRepository extends InMemoryUserRepository {
        override async list(): Promise<never> {
          throw new userErrors.UserPersistenceError("disk unavailable");
        }
      }
      return { users: new FailingUserRepository(), patients: new InMemoryPatientRepository() };
    });
    const handlers = await loadHandlers(api);
    api.signInAs(api.admin);

    const response = await handlers.list(getRequest());

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: { code: "STORAGE_UNAVAILABLE" } });
  });
});
