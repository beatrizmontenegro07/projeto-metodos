import { describe, expect, it } from "vitest";

import type { PatientData } from "./patient";
import { PatientMemento, PatientUpdateHistory, toPatientData } from "./patient-memento";

const DATA: PatientData = {
  name: "Joana Souza Lima",
  cpf: "12345678909",
  birthDate: "1985-03-12",
  gender: "FEMALE",
  phone: "83987654321",
  legalBasis: "HEALTH_PROTECTION",
};

describe("the patient memento (Memento)", () => {
  it("keeps a copy that later changes to the source cannot reach", () => {
    const source = { ...DATA };
    const memento = new PatientMemento(1, source);
    source.name = "Changed";

    expect(memento.getState()).toEqual(DATA);
  });

  it("cannot be changed after it is created", () => {
    const memento = new PatientMemento(1, DATA);

    expect(Object.isFrozen(memento)).toBe(true);
    expect(Object.isFrozen(memento.getState())).toBe(true);
    expect(() => {
      (memento.getState() as PatientData).name = "Changed";
    }).toThrow(TypeError);
  });

  it("saves only the data an update replaces", () => {
    expect(toPatientData({ ...DATA, id: 1, active: false, createdBy: 7 })).toEqual(DATA);
  });
});

describe("the patient update history (Caretaker)", () => {
  it("returns the newest memento of each patient first", () => {
    const history = new PatientUpdateHistory();
    const first = new PatientMemento(1, DATA);
    const second = new PatientMemento(1, { ...DATA, name: "Joana Lima" });
    const other = new PatientMemento(2, DATA);
    history.push(first);
    history.push(other);
    history.push(second);

    expect(history.peek(1)).toBe(second);
    expect(history.pop(1)).toBe(second);
    expect(history.pop(1)).toBe(first);
    expect(history.has(1)).toBe(false);
    expect(history.pop(1)).toBeUndefined();
    expect(history.peek(2)).toBe(other);
  });
});
