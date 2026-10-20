import { beforeEach, describe, expect, it, vi } from "vitest";

import { InMemoryPatientRepository } from "@/infra/patients/in-memory-patient-repository";
import { InMemoryUserRepository } from "@/infra/users/in-memory-user-repository";
import type { PatientInput } from "@/modules/patients/patient";
import type { Role } from "@/modules/users/role";
import type { NewUser, User } from "@/modules/users/user";

import type { FacadeSingletonController } from "./facade-singleton-controller";
import type { Repositories } from "./repositories";

const JOANA: PatientInput = {
  name: "Joana Souza Lima",
  cpf: "123.456.789-09",
  birthDate: "1985-03-12",
  gender: "FEMALE",
  phone: "(83) 98765-4321",
  legalBasis: "HEALTH_PROTECTION",
};

function newUser(login: string, role: Role): NewUser {
  return { name: login, email: `${login}@clinicore.com`, login, password: "Secret@123", role };
}

// The singleton lives in a static field, so each test imports a fresh copy of the class. The
// fresh copy also brings fresh error classes, so denials are matched by their code.
const ACCESS_DENIED = { code: "ACCESS_DENIED" };

async function loadFacadeClass() {
  vi.resetModules();
  return (await import("./facade-singleton-controller")).FacadeSingletonController;
}

function memoryRepositories(): Repositories {
  return { users: new InMemoryUserRepository(), patients: new InMemoryPatientRepository() };
}

describe("a single facade instance (Singleton)", () => {
  it("returns the same instance on every call and loads the repositories once", async () => {
    const Facade = await loadFacadeClass();
    const loadRepositories = vi.fn(async () => memoryRepositories());

    const [first, second] = await Promise.all([
      Facade.getInstance(loadRepositories),
      Facade.getInstance(loadRepositories),
    ]);

    expect(first).toBe(second);
    expect(loadRepositories).toHaveBeenCalledTimes(1);
  });
});

describe("operations through the facade", () => {
  let facade: FacadeSingletonController;
  let admin: User;
  let receptionist: User;
  let doctor: User;

  beforeEach(async () => {
    const Facade = await loadFacadeClass();
    facade = await Facade.getInstance(async () => memoryRepositories());
    admin = await facade.createFirstAdministrator({
      name: "Carla Souza",
      email: "carla@clinicore.com",
      login: "carla",
      password: "Secret@123",
    });
    receptionist = await facade.addUser(admin, newUser("ana", "RECEPTIONIST"));
    doctor = await facade.addUser(admin, newUser("bruno", "DOCTOR"));
  });

  it("signs in through the authentication controller", async () => {
    expect(await facade.signIn({ identifier: "ana", password: "Secret@123" })).toEqual(receptionist);
  });

  it("registers a patient linked to the signed-in user", async () => {
    const patient = await facade.addPatient(receptionist, JOANA);

    expect(patient.createdBy).toBe(receptionist.id);
    expect(await facade.getPatient(admin, patient.id)).toEqual(patient);
  });

  it("denies user management to a receptionist", async () => {
    await expect(facade.listUsers(receptionist)).rejects.toMatchObject(ACCESS_DENIED);
    await expect(facade.addUser(receptionist, newUser("bia", "ADMIN"))).rejects.toMatchObject(ACCESS_DENIED);
  });

  it("denies patient management to a doctor without storing anything", async () => {
    await expect(facade.addPatient(doctor, JOANA)).rejects.toMatchObject(ACCESS_DENIED);
    await expect(facade.searchPatients(doctor, { text: "", status: "all" })).rejects.toMatchObject(ACCESS_DENIED);
    expect(await facade.countRegisteredEntities(admin)).toEqual({ users: 3, patients: 0 });
  });

  describe("counting registered entities (RF15)", () => {
    beforeEach(async () => {
      const joana = await facade.addPatient(receptionist, JOANA);
      await facade.deactivatePatient(receptionist, joana.id);
      await facade.addPatient(receptionist, { ...JOANA, name: "Bruno Lima", cpf: "529.982.247-25" });
    });

    it("gives the administrator the users and the active and inactive patients", async () => {
      expect(await facade.countRegisteredEntities(admin)).toEqual({ users: 3, patients: 2 });
    });

    it("gives the receptionist only the patients", async () => {
      expect(await facade.countRegisteredEntities(receptionist)).toEqual({ patients: 2 });
    });

    it("gives the doctor no totals", async () => {
      expect(await facade.countRegisteredEntities(doctor)).toEqual({});
    });
  });
});
