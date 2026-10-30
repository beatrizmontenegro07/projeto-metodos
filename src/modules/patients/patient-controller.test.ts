import { beforeEach, describe, expect, it } from "vitest";

import { InMemoryPatientRepository } from "@/infra/patients/in-memory-patient-repository";

import {
  DuplicatePatientError,
  InvalidAddressError,
  InvalidBirthDateError,
  InvalidCpfError,
  InvalidGenderError,
  InvalidLegalBasisError,
  InvalidPatientEmailError,
  InvalidPatientNameError,
  InvalidPhoneError,
  PatientNotFoundError,
  type PatientValidationErrorCode,
} from "./errors";
import type { PatientInput } from "./patient";
import { PatientController } from "./patient-controller";

const TODAY = new Date(2026, 9, 19, 12);
const RECEPTIONIST_ID = 7;

function validInput(overrides: Partial<PatientInput> = {}): PatientInput {
  return {
    name: "Joana Souza Lima",
    cpf: "123.456.789-09",
    birthDate: "1985-03-12",
    gender: "FEMALE",
    phone: "(83) 98765-4321",
    email: "",
    address: "",
    legalBasis: "HEALTH_PROTECTION",
    ...overrides,
  };
}

type ErrorClass = abstract new (...args: never[]) => Error;
type RuleCase = [scenario: string, overrides: Partial<PatientInput>, errorClass: ErrorClass, code: PatientValidationErrorCode];

function createController() {
  return new PatientController(new InMemoryPatientRepository(), () => TODAY);
}

async function expectValidationError(operation: Promise<unknown>, errorClass: ErrorClass, code: PatientValidationErrorCode) {
  await expect(operation).rejects.toBeInstanceOf(errorClass);
  await expect(operation).rejects.toHaveProperty("code", code);
}

describe("registering patients (RF01)", () => {
  let controller: PatientController;

  beforeEach(() => {
    controller = createController();
  });

  it("stores an active patient linked to the user who registered it", async () => {
    const patient = await controller.add(validInput({ email: "Joana@Mail.com" }), RECEPTIONIST_ID);

    expect(patient).toEqual({
      id: 1,
      name: "Joana Souza Lima",
      cpf: "12345678909",
      birthDate: "1985-03-12",
      gender: "FEMALE",
      phone: "83987654321",
      email: "joana@mail.com",
      legalBasis: "HEALTH_PROTECTION",
      active: true,
      createdBy: RECEPTIONIST_ID,
    });
  });

  it("should reject a CPF already registered, whatever its punctuation", async () => {
    await controller.add(validInput(), RECEPTIONIST_ID);

    await expectValidationError(
      controller.add(validInput({ name: "Other Person", cpf: "12345678909" }), RECEPTIONIST_ID),
      DuplicatePatientError,
      "CPF_ALREADY_REGISTERED",
    );
  });

  it("should reject a CPF that belongs to an inactive patient", async () => {
    const joana = await controller.add(validInput(), RECEPTIONIST_ID);
    await controller.deactivate(joana.id);

    await expectValidationError(
      controller.add(validInput({ name: "Other Person" }), RECEPTIONIST_ID),
      DuplicatePatientError,
      "CPF_ALREADY_REGISTERED",
    );
  });

  it("should accept blank e-mail and address as absent", async () => {
    const patient = await controller.add(validInput({ email: "  ", address: "" }), RECEPTIONIST_ID);

    expect(patient.email).toBeUndefined();
    expect(patient.address).toBeUndefined();
  });

  it("should accept a birth date equal to today", async () => {
    const patient = await controller.add(validInput({ birthDate: "2026-10-19" }), RECEPTIONIST_ID);

    expect(patient.birthDate).toBe("2026-10-19");
  });
});

describe("patient data rules (RF11)", () => {
  it.each<RuleCase>([
    ["should reject an empty name", { name: "   " }, InvalidPatientNameError, "PATIENT_NAME_EMPTY"],
    ["should reject a name longer than 120 characters", { name: "a".repeat(121) }, InvalidPatientNameError, "PATIENT_NAME_TOO_LONG"],
    ["should reject an empty CPF", { cpf: "" }, InvalidCpfError, "CPF_EMPTY"],
    ["should reject a CPF without 11 digits", { cpf: "123.456.789" }, InvalidCpfError, "CPF_WRONG_LENGTH"],
    ["should reject a CPF with a wrong check digit", { cpf: "123.456.789-00" }, InvalidCpfError, "CPF_INVALID"],
    ["should reject a CPF with all digits equal", { cpf: "111.111.111-11" }, InvalidCpfError, "CPF_INVALID"],
    ["should reject a CPF with letters", { cpf: "123.456.789-0A" }, InvalidCpfError, "CPF_INVALID"],
    ["should reject an empty birth date", { birthDate: "" }, InvalidBirthDateError, "BIRTH_DATE_EMPTY"],
    ["should reject a birth date that does not exist", { birthDate: "1990-02-31" }, InvalidBirthDateError, "BIRTH_DATE_INVALID"],
    ["should reject a birth date outside the ISO format", { birthDate: "12/03/1985" }, InvalidBirthDateError, "BIRTH_DATE_INVALID"],
    ["should reject a birth date in the future", { birthDate: "2026-10-20" }, InvalidBirthDateError, "BIRTH_DATE_IN_FUTURE"],
    ["should reject a gender outside the FHIR codes", { gender: "F" }, InvalidGenderError, "GENDER_INVALID"],
    ["should reject an empty phone", { phone: "" }, InvalidPhoneError, "PHONE_EMPTY"],
    ["should reject a phone without area code", { phone: "98765-4321" }, InvalidPhoneError, "PHONE_INVALID"],
    ["should reject a phone with letters", { phone: "(83) 9876A-4321" }, InvalidPhoneError, "PHONE_INVALID"],
    ["should reject an invalid e-mail", { email: "joana@" }, InvalidPatientEmailError, "PATIENT_EMAIL_INVALID"],
    ["should reject an address longer than 200 characters", { address: "a".repeat(201) }, InvalidAddressError, "ADDRESS_TOO_LONG"],
    ["should reject a missing legal basis", { legalBasis: "" }, InvalidLegalBasisError, "LEGAL_BASIS_MISSING"],
    ["should reject an unknown legal basis", { legalBasis: "CONTRACT" }, InvalidLegalBasisError, "LEGAL_BASIS_INVALID"],
  ])("%s", async (_scenario, overrides, errorClass, code) => {
    await expectValidationError(createController().add(validInput(overrides), RECEPTIONIST_ID), errorClass, code);
  });

  it.each(["(83) 3222-1100", "83987654321"])("should accept the phone %s", async (phone) => {
    const patient = await createController().add(validInput({ phone }), RECEPTIONIST_ID);

    expect(patient.phone).toBe(phone.replace(/\D/g, ""));
  });
});

describe("editing patients (RF12)", () => {
  let controller: PatientController;

  beforeEach(() => {
    controller = createController();
  });

  it("replaces the data and keeps the status and the author", async () => {
    const joana = await controller.add(validInput({ email: "joana@mail.com" }), RECEPTIONIST_ID);
    await controller.deactivate(joana.id);

    const edited = await controller.update(joana.id, validInput({ phone: "(83) 3222-1100" }));

    expect(edited).toMatchObject({ phone: "8332221100", active: false, createdBy: RECEPTIONIST_ID });
    expect(edited.email).toBeUndefined();
  });

  it("should accept the patient's own CPF", async () => {
    const joana = await controller.add(validInput(), RECEPTIONIST_ID);

    const edited = await controller.update(joana.id, validInput({ name: "Joana S. Lima" }));

    expect(edited.name).toBe("Joana S. Lima");
  });

  it("should reject the CPF of another patient", async () => {
    await controller.add(validInput(), RECEPTIONIST_ID);
    const bruno = await controller.add(validInput({ name: "Bruno Lima", cpf: "529.982.247-25" }), RECEPTIONIST_ID);

    await expectValidationError(
      controller.update(bruno.id, validInput({ name: "Bruno Lima" })),
      DuplicatePatientError,
      "CPF_ALREADY_REGISTERED",
    );
  });

  it("should report a patient that does not exist", async () => {
    await expect(controller.update(99, validInput())).rejects.toBeInstanceOf(PatientNotFoundError);
    await expect(controller.get(99)).rejects.toBeInstanceOf(PatientNotFoundError);
  });
});

describe("inactivating and reactivating patients (RF13)", () => {
  it("keeps the data while switching the status", async () => {
    const controller = createController();
    const joana = await controller.add(validInput(), RECEPTIONIST_ID);

    expect(await controller.deactivate(joana.id)).toEqual({ ...joana, active: false });
    expect(await controller.reactivate(joana.id)).toEqual(joana);
  });
});

describe("searching patients (RF14)", () => {
  let controller: PatientController;

  beforeEach(async () => {
    controller = createController();
    await controller.add(validInput({ name: "João Pereira", cpf: "529.982.247-25" }), RECEPTIONIST_ID);
    await controller.add(validInput({ name: "Maria Alves", cpf: "987.654.321-00" }), RECEPTIONIST_ID);
    const alvaro = await controller.add(validInput({ name: "Álvaro Dias" }), RECEPTIONIST_ID);
    await controller.deactivate(alvaro.id);
  });

  async function namesFound(text: string, status: "all" | "active" | "inactive" = "all") {
    return (await controller.search({ text, status })).map((patient) => patient.name);
  }

  it("lists every patient in alphabetical order, ignoring accents", async () => {
    expect(await namesFound("")).toEqual(["Álvaro Dias", "João Pereira", "Maria Alves"]);
  });

  it("finds a name typed without accents or capitals", async () => {
    expect(await namesFound("joao")).toEqual(["João Pereira"]);
  });

  it("finds part of a CPF typed with punctuation", async () => {
    expect(await namesFound("456.789")).toEqual(["Álvaro Dias"]);
  });

  it("filters by status", async () => {
    expect(await namesFound("", "inactive")).toEqual(["Álvaro Dias"]);
    expect(await namesFound("", "active")).toEqual(["João Pereira", "Maria Alves"]);
  });

  it("returns an empty list when nothing matches", async () => {
    expect(await namesFound("zzz")).toEqual([]);
  });

  it("counts active and inactive patients", async () => {
    expect(await controller.count()).toBe(3);
  });
});
