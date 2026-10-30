import { DuplicatePatientError, PatientNotFoundError } from "@/modules/patients/errors";
import type { Patient, PatientData, PatientStatusFilter } from "@/modules/patients/patient";
import type { NewPatientRecord, PatientCriteria, PatientRepository } from "@/modules/patients/patient-repository";
import { toSearchKey } from "@/modules/patients/rules";

const STATUS_MATCHES: Record<PatientStatusFilter, (patient: Patient) => boolean> = {
  all: () => true,
  active: (patient) => patient.active,
  inactive: (patient) => !patient.active,
};

/** RAM mechanism: patients live in a collection and are lost when the process exits. */
export class InMemoryPatientRepository implements PatientRepository {
  private readonly storedPatients: Patient[] = [];
  private nextId = 1;

  async add(record: NewPatientRecord): Promise<Patient> {
    this.ensureCpfIsAvailable(record.cpf);
    const patient: Patient = { id: this.nextId++, active: true, ...record };
    this.storedPatients.push(patient);
    return { ...patient };
  }

  async update(id: number, data: PatientData): Promise<Patient> {
    const { active, createdBy } = this.findStoredPatient(id);
    this.ensureCpfIsAvailable(data.cpf, id);
    return this.replace({ id, active, createdBy, ...data });
  }

  async setActive(id: number, active: boolean): Promise<Patient> {
    return this.replace({ ...this.findStoredPatient(id), active });
  }

  async findById(id: number): Promise<Patient | undefined> {
    const patient = this.storedPatients.find((stored) => stored.id === id);
    return patient && { ...patient };
  }

  async list({ status, nameContains, cpfContains }: PatientCriteria): Promise<Patient[]> {
    return this.storedPatients
      .filter(STATUS_MATCHES[status])
      .filter((patient) => nameContains === undefined || toSearchKey(patient.name).includes(nameContains))
      .filter((patient) => cpfContains === undefined || patient.cpf.includes(cpfContains))
      .sort(byNameThenId)
      .map((patient) => ({ ...patient }));
  }

  async count(): Promise<number> {
    return this.storedPatients.length;
  }

  private findStoredPatient(id: number): Patient {
    const patient = this.storedPatients.find((stored) => stored.id === id);
    if (!patient) throw new PatientNotFoundError(id);
    return patient;
  }

  private replace(patient: Patient): Patient {
    const index = this.storedPatients.findIndex((stored) => stored.id === patient.id);
    this.storedPatients[index] = patient;
    return { ...patient };
  }

  private ensureCpfIsAvailable(cpf: string, ownerId?: number): void {
    if (this.storedPatients.some((patient) => patient.cpf === cpf && patient.id !== ownerId)) {
      throw new DuplicatePatientError();
    }
  }
}

function byNameThenId(first: Patient, second: Patient): number {
  const [firstKey, secondKey] = [toSearchKey(first.name), toSearchKey(second.name)];
  if (firstKey !== secondKey) return firstKey < secondKey ? -1 : 1;
  return first.id - second.id;
}
