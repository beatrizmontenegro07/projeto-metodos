import { beforeEach, describe, expect, it } from "vitest";

import { InMemoryPatientRepository } from "@/infra/patients/in-memory-patient-repository";
import { DuplicatePatientError, InvalidPatientNameError, NoUpdateToUndoError } from "@/modules/patients/errors";
import type { Patient, PatientInput } from "@/modules/patients/patient";
import { PatientController } from "@/modules/patients/patient-controller";
import { PatientUpdateHistory } from "@/modules/patients/patient-memento";

import { CanUndoPatientUpdateCommand, UndoPatientUpdateCommand, UpdatePatientCommand } from "./patient-commands";

const JOANA: PatientInput = {
  name: "Joana Souza Lima",
  cpf: "123.456.789-09",
  birthDate: "1985-03-12",
  gender: "FEMALE",
  phone: "(83) 98765-4321",
  email: "joana@example.com",
  address: "",
  legalBasis: "HEALTH_PROTECTION",
};
const BRUNO_CPF = "529.982.247-25";

describe("updating and undoing through commands (RF12, RF19)", () => {
  let patients: PatientController;
  let history: PatientUpdateHistory;
  let joana: Patient;

  beforeEach(async () => {
    patients = new PatientController(new InMemoryPatientRepository(), () => new Date(2026, 10, 18, 12));
    history = new PatientUpdateHistory();
    joana = await patients.add(JOANA, 1);
  });

  const update = (input: Partial<PatientInput>, id = joana.id) =>
    new UpdatePatientCommand(patients, history, id, { ...JOANA, ...input }).execute();
  const undo = (id = joana.id) => new UndoPatientUpdateCommand(patients, history, id).execute();
  const canUndo = (id = joana.id) => new CanUndoPatientUpdateCommand(history, id).execute();

  it("should offer no undo before any update", async () => {
    expect(await canUndo()).toBe(false);
    await expect(undo()).rejects.toBeInstanceOf(NoUpdateToUndoError);
    await expect(undo()).rejects.toHaveProperty("code", "NO_UPDATE_TO_UNDO");
  });

  it("restores the data from before the last update, keeping status and author", async () => {
    await patients.deactivate(joana.id);
    await update({ name: "Joana Lima", phone: "(83) 3222-1111", email: "" });
    expect(await canUndo()).toBe(true);

    const restored = await undo();

    expect(restored).toEqual({ ...joana, active: false });
    expect(await patients.get(joana.id)).toEqual(restored);
    expect(await canUndo()).toBe(false);
  });

  it("undoes successive updates one at a time, newest first", async () => {
    await update({ name: "Joana Lima" });
    await update({ name: "Joana S. Lima" });

    expect((await undo()).name).toBe("Joana Lima");
    expect((await undo()).name).toBe("Joana Souza Lima");
    await expect(undo()).rejects.toBeInstanceOf(NoUpdateToUndoError);
  });

  it("should keep nothing to undo when the update is rejected", async () => {
    await expect(update({ name: "" })).rejects.toBeInstanceOf(InvalidPatientNameError);
    expect(await canUndo()).toBe(false);
  });

  it("keeps one history per patient", async () => {
    const bruno = await patients.add({ ...JOANA, name: "Bruno Lima", cpf: BRUNO_CPF }, 1);
    await update({ name: "Joana Lima" });

    expect(await canUndo(bruno.id)).toBe(false);
    await expect(undo(bruno.id)).rejects.toBeInstanceOf(NoUpdateToUndoError);
    expect((await undo()).name).toBe("Joana Souza Lima");
  });

  it("should keep the memento when the old CPF now belongs to another patient", async () => {
    await update({ cpf: BRUNO_CPF });
    await patients.add({ ...JOANA, name: "Outra Joana" }, 1);

    await expect(undo()).rejects.toBeInstanceOf(DuplicatePatientError);
    expect(await canUndo()).toBe(true);
    expect((await patients.get(joana.id)).cpf).toBe("52998224725");
  });
});
