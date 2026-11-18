import { NoUpdateToUndoError } from "@/modules/patients/errors";
import type { Patient, PatientInput, PatientSearch } from "@/modules/patients/patient";
import type { PatientController } from "@/modules/patients/patient-controller";
import type { PatientUpdateHistory } from "@/modules/patients/patient-memento";

import type { Command } from "./command";

/** Commands whose receiver is `PatientController`. */
export class AddPatientCommand implements Command<Patient> {
  constructor(
    private readonly patients: PatientController,
    private readonly input: PatientInput,
    private readonly createdBy: number,
  ) {}

  execute(): Promise<Patient> {
    return this.patients.add(this.input, this.createdBy);
  }
}

/**
 * RF12 with RF19: saves a memento of the current data (originator), replaces the data, and only
 * after the update succeeds hands the memento to the caretaker. A rejected update leaves nothing
 * to undo.
 */
export class UpdatePatientCommand implements Command<Patient> {
  constructor(
    private readonly patients: PatientController,
    private readonly history: PatientUpdateHistory,
    private readonly id: number,
    private readonly input: PatientInput,
  ) {}

  async execute(): Promise<Patient> {
    const memento = await this.patients.createMemento(this.id);
    const updated = await this.patients.update(this.id, this.input);
    this.history.push(memento);
    return updated;
  }
}

/** RF19: restores the data saved before the patient's last update. */
export class UndoPatientUpdateCommand implements Command<Patient> {
  constructor(
    private readonly patients: PatientController,
    private readonly history: PatientUpdateHistory,
    private readonly id: number,
  ) {}

  async execute(): Promise<Patient> {
    const memento = this.history.peek(this.id);
    if (!memento) throw new NoUpdateToUndoError(this.id);
    const restored = await this.patients.restore(memento);
    this.history.pop(this.id);
    return restored;
  }
}

/** RF19: whether the screen should offer "Undo last change". */
export class CanUndoPatientUpdateCommand implements Command<boolean> {
  constructor(
    private readonly history: PatientUpdateHistory,
    private readonly id: number,
  ) {}

  async execute(): Promise<boolean> {
    return this.history.has(this.id);
  }
}

export class DeactivatePatientCommand implements Command<Patient> {
  constructor(
    private readonly patients: PatientController,
    private readonly id: number,
  ) {}

  execute(): Promise<Patient> {
    return this.patients.deactivate(this.id);
  }
}

export class ReactivatePatientCommand implements Command<Patient> {
  constructor(
    private readonly patients: PatientController,
    private readonly id: number,
  ) {}

  execute(): Promise<Patient> {
    return this.patients.reactivate(this.id);
  }
}

export class GetPatientCommand implements Command<Patient> {
  constructor(
    private readonly patients: PatientController,
    private readonly id: number,
  ) {}

  execute(): Promise<Patient> {
    return this.patients.get(this.id);
  }
}

export class SearchPatientsCommand implements Command<Patient[]> {
  constructor(
    private readonly patients: PatientController,
    private readonly search: PatientSearch,
  ) {}

  execute(): Promise<Patient[]> {
    return this.patients.search(this.search);
  }
}
