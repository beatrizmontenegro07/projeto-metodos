import type { Patient, PatientData } from "./patient";

/**
 * Memento (S5.2, ADR-0013): an immutable snapshot of a patient's data before an update. Only the
 * originator, `PatientController`, reads the state back (`restore`); the caretaker keeps the
 * memento by patient id without looking inside it.
 */
export class PatientMemento {
  private readonly state: Readonly<PatientData>;

  constructor(
    readonly patientId: number,
    state: PatientData,
  ) {
    this.state = Object.freeze({ ...state });
    Object.freeze(this);
  }

  /** For the originator only. */
  getState(): Readonly<PatientData> {
    return this.state;
  }
}

/** The data an update replaces: everything except the id, the status, and the author. */
export function toPatientData({ name, cpf, birthDate, gender, phone, email, address, legalBasis }: Patient): PatientData {
  return {
    name,
    cpf,
    birthDate,
    gender,
    phone,
    ...(email === undefined ? {} : { email }),
    ...(address === undefined ? {} : { address }),
    legalBasis,
  };
}

/**
 * Caretaker of the Memento pattern: one stack of mementos per patient, newest on top, kept in
 * the process memory. Each successful update pushes the state it replaced; an undo restores the
 * top memento and only then drops it, so a failed restoration can be tried again.
 */
export class PatientUpdateHistory {
  private readonly stacks = new Map<number, PatientMemento[]>();

  push(memento: PatientMemento): void {
    const stack = this.stacks.get(memento.patientId) ?? [];
    stack.push(memento);
    this.stacks.set(memento.patientId, stack);
  }

  peek(patientId: number): PatientMemento | undefined {
    return this.stacks.get(patientId)?.at(-1);
  }

  pop(patientId: number): PatientMemento | undefined {
    const stack = this.stacks.get(patientId);
    const memento = stack?.pop();
    if (stack?.length === 0) this.stacks.delete(patientId);
    return memento;
  }

  has(patientId: number): boolean {
    return this.stacks.has(patientId);
  }
}
