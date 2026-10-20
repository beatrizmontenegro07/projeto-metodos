import { beforeEach, describe, expect, it, vi } from "vitest";

import type { User } from "@/modules/users/user";

import { createTestApi, jsonRequest, type TestApi } from "../../api-test-support";

const SESSION_URL = "http://localhost/api/auth/session";

function signInRequest(body: unknown) {
  return jsonRequest(SESSION_URL, "POST", body);
}

describe("/api/auth/session", () => {
  let api: TestApi;
  let startSession: ReturnType<typeof vi.fn<(user: User) => Promise<void>>>;
  let endSession: ReturnType<typeof vi.fn<() => Promise<void>>>;
  let handlers: ReturnType<typeof import("./session-handlers").createSessionHandlers>;

  beforeEach(async () => {
    api = await createTestApi();
    startSession = vi.fn(async () => undefined);
    endSession = vi.fn(async () => undefined);
    const { createSessionHandlers } = await import("./session-handlers");
    handlers = createSessionHandlers({ getFacade: api.context.getFacade, startSession, endSession });
  });

  it("POST opens the session of the user and answers with the user", async () => {
    const response = await handlers.signIn(signInRequest({ identifier: "ana", password: "Secret@123" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(api.receptionist);
    expect(startSession).toHaveBeenCalledWith(api.receptionist);
  });

  it("answers 401 CREDENTIALS_INCORRECT for a wrong password without opening a session", async () => {
    const response = await handlers.signIn(signInRequest({ identifier: "ana", password: "Wrong@123" }));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: { code: "CREDENTIALS_INCORRECT", message: "Login ou senha incorretos." },
    });
    expect(startSession).not.toHaveBeenCalled();
  });

  it("answers 400 SIGN_IN_IDENTIFIER_EMPTY for an empty identifier", async () => {
    const response = await handlers.signIn(signInRequest({ identifier: "", password: "Secret@123" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: { code: "SIGN_IN_IDENTIFIER_EMPTY" } });
  });

  it("answers 400 INVALID_REQUEST_BODY when the password is missing", async () => {
    const response = await handlers.signIn(signInRequest({ identifier: "ana" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: { code: "INVALID_REQUEST_BODY" } });
  });

  it("DELETE ends the session", async () => {
    const response = await handlers.signOut();

    expect(response.status).toBe(204);
    expect(endSession).toHaveBeenCalledOnce();
  });
});
