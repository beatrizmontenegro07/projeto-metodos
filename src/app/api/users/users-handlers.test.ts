import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";

import { InMemoryUserRepository } from "@/infra/users/in-memory-user-repository";
import { UserPersistenceError } from "@/modules/users/errors";
import { UserController } from "@/modules/users/user-controller";
import type { UserRepository } from "@/modules/users/user-repository";

import { createUsersHandlers } from "./users-handlers";

const USERS_URL = "http://localhost/api/users";

const ANA = {
  name: "Ana Silva",
  email: "ana@clinicore.com",
  login: "ana",
  password: "Secret@123",
  role: "RECEPTIONIST",
};

function getRequest() {
  return new NextRequest(USERS_URL);
}

function postRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest(USERS_URL, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function handlersFor(repository: UserRepository) {
  return createUsersHandlers(async () => new UserController(repository));
}

describe("/api/users", () => {
  let handlers: ReturnType<typeof createUsersHandlers>;

  beforeEach(() => {
    handlers = handlersFor(new InMemoryUserRepository());
  });

  it("POST adds a user through UserController and answers 201 without the password", async () => {
    const response = await handlers.add(postRequest(ANA));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      id: 1,
      name: "Ana Silva",
      email: "ana@clinicore.com",
      login: "ana",
      role: "RECEPTIONIST",
    });
  });

  it("GET lists the registered users", async () => {
    await handlers.add(postRequest(ANA));

    const response = await handlers.list(getRequest());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      { id: 1, name: "Ana Silva", email: "ana@clinicore.com", login: "ana", role: "RECEPTIONIST" },
    ]);
  });

  it("answers 400 with the specific code and the pt-BR message by default", async () => {
    const response = await handlers.add(postRequest({ ...ANA, login: "ana1" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: { code: "LOGIN_HAS_NUMBERS", message: "O login não pode conter números." },
    });
  });

  it("answers in English when the browser prefers it", async () => {
    const response = await handlers.add(
      postRequest({ ...ANA, password: "Secret1" }, { "accept-language": "en-US,en;q=0.9" }),
    );

    expect(await response.json()).toEqual({
      error: { code: "PASSWORD_TOO_SHORT", message: "The password must have at least 8 characters." },
    });
  });

  it("answers in the language saved in the NEXT_LOCALE cookie before the browser language", async () => {
    const response = await handlers.add(
      postRequest({ ...ANA, login: "" }, { cookie: "NEXT_LOCALE=en", "accept-language": "pt-BR" }),
    );

    expect(await response.json()).toEqual({ error: { code: "LOGIN_EMPTY", message: "Enter a login." } });
  });

  it("answers 409 when the e-mail is already registered", async () => {
    await handlers.add(postRequest(ANA));

    const response = await handlers.add(postRequest({ ...ANA, login: "other" }));

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: { code: "EMAIL_ALREADY_REGISTERED", message: "Já existe um usuário cadastrado com este e-mail." },
    });
  });

  it.each([
    ["not JSON", "{name:"],
    ["not an object", "[]"],
    ["missing the e-mail", JSON.stringify({ ...ANA, email: undefined })],
  ])("answers 400 INVALID_REQUEST_BODY when the body is %s", async (_case, body) => {
    const response = await handlers.add(postRequest(body));

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: { code: "INVALID_REQUEST_BODY" } });
  });

  it("answers 503 when the storage fails", async () => {
    const failingRepository: UserRepository = {
      add: async () => {
        throw new UserPersistenceError("disk unavailable");
      },
      list: async () => {
        throw new UserPersistenceError("disk unavailable");
      },
    };

    const response = await handlersFor(failingRepository).list(getRequest());

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: { code: "STORAGE_UNAVAILABLE" } });
  });
});
