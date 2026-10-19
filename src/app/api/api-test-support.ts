import { NextRequest } from "next/server";
import { vi } from "vitest";

import type { Repositories } from "@/modules/facade/repositories";
import type { User } from "@/modules/users/user";

import type { ApiContext } from "./api-responses";

export type TestModules = {
  userErrors: typeof import("@/modules/users/errors");
  InMemoryUserRepository: typeof import("@/infra/users/in-memory-user-repository").InMemoryUserRepository;
  InMemoryPatientRepository: typeof import("@/infra/patients/in-memory-patient-repository").InMemoryPatientRepository;
};

export type TestApi = {
  context: ApiContext;
  admin: User;
  receptionist: User;
  doctor: User;
  signInAs: (user: User | undefined) => void;
};

function memoryRepositories({ InMemoryUserRepository, InMemoryPatientRepository }: TestModules): Repositories {
  return { users: new InMemoryUserRepository(), patients: new InMemoryPatientRepository() };
}

/**
 * Builds the facade over RAM repositories with one user per role. The facade is a Singleton,
 * so this starts a fresh module registry: import the handlers under test with `await import()`
 * after calling it, so they and the facade share the same error classes.
 */
export async function createTestApi(
  createRepositories: (modules: TestModules) => Repositories = memoryRepositories,
): Promise<TestApi> {
  vi.resetModules();
  const modules: TestModules = {
    userErrors: await import("@/modules/users/errors"),
    InMemoryUserRepository: (await import("@/infra/users/in-memory-user-repository")).InMemoryUserRepository,
    InMemoryPatientRepository: (await import("@/infra/patients/in-memory-patient-repository")).InMemoryPatientRepository,
  };
  const { FacadeSingletonController } = await import("@/modules/facade/facade-singleton-controller");
  const facade = await FacadeSingletonController.getInstance(async () => createRepositories(modules));

  const admin = await facade.createFirstAdministrator(staff("carla"));
  const receptionist = await facade.addUser(admin, { ...staff("ana"), role: "RECEPTIONIST" });
  const doctor = await facade.addUser(admin, { ...staff("bruno"), role: "DOCTOR" });

  let actor: User | undefined;
  return {
    context: { getFacade: async () => facade, authenticate: async () => actor },
    admin,
    receptionist,
    doctor,
    signInAs: (user) => {
      actor = user;
    },
  };
}

function staff(login: string) {
  return { name: login, email: `${login}@clinicore.com`, login, password: "Secret@123" };
}

export function jsonRequest(url: string, method: string, body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest(url, {
    method,
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}
