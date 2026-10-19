import { PatientNotFoundError } from "./errors";
import type { Patient, PatientInput, PatientSearch } from "./patient";
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
}

function toCriteria({ text, status }: PatientSearch): PatientCriteria {
  const trimmed = text.trim();
  if (trimmed.length === 0) return { status };
  if (CPF_SEARCH.test(trimmed)) return { status, cpfContains: onlyDigits(trimmed) };
  return { status, nameContains: toSearchKey(trimmed) };
}
