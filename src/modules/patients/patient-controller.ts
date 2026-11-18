import { PatientNotFoundError } from "./errors";
import type { Patient, PatientInput, PatientSearch } from "./patient";
import { PatientMemento, toPatientData } from "./patient-memento";
import type { PatientCriteria, PatientRepository } from "./patient-repository";
import { normalizePatientInput, onlyDigits, toSearchKey } from "./rules";

// A search made only of digits and CPF punctuation looks for a CPF; anything else, for a name.
const CPF_SEARCH = /^[\d.\-\s]*\d[\d.\-\s]*$/;

export class PatientController {
  /** `now` is injectable so the "birth date in the future" rule can be tested on a fixed day. */
  constructor(
    private readonly repository: PatientRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async add(input: PatientInput, createdBy: number): Promise<Patient> {
    return this.repository.add({ ...normalizePatientInput(input, this.now()), createdBy });
  }

  async update(id: number, input: PatientInput): Promise<Patient> {
    return this.repository.update(id, normalizePatientInput(input, this.now()));
  }

  deactivate(id: number): Promise<Patient> {
    return this.repository.setActive(id, false);
  }

  reactivate(id: number): Promise<Patient> {
    return this.repository.setActive(id, true);
  }

  async get(id: number): Promise<Patient> {
    const patient = await this.repository.findById(id);
    if (!patient) throw new PatientNotFoundError(id);
    return patient;
  }

  search(search: PatientSearch): Promise<Patient[]> {
    return this.repository.list(toCriteria(search));
  }

  count(): Promise<number> {
    return this.repository.count();
  }

  /** Originator of the Memento pattern (S5.2): saves the patient's current data. */
  async createMemento(id: number): Promise<PatientMemento> {
    return new PatientMemento(id, toPatientData(await this.get(id)));
  }

  /**
   * Puts back the data saved in the memento. The data was validated when it was saved, so it is
   * not validated again; storage still rejects a CPF that another patient took in the meantime.
   */
  restore(memento: PatientMemento): Promise<Patient> {
    return this.repository.update(memento.patientId, { ...memento.getState() });
  }
}

function toCriteria({ text, status }: PatientSearch): PatientCriteria {
  const trimmed = text.trim();
  if (trimmed.length === 0) return { status };
  if (CPF_SEARCH.test(trimmed)) return { status, cpfContains: onlyDigits(trimmed) };
  return { status, nameContains: toSearchKey(trimmed) };
}
