import type { AccessRecordRepository } from "@/modules/access-records/access-record-repository";
import type { PatientRepository } from "@/modules/patients/patient-repository";
import type { UserRepository } from "@/modules/users/user-repository";

/** One repository per entity, all built for the same storage mechanism (STORAGE). */
export type Repositories = {
  accesses: AccessRecordRepository;
  users: UserRepository;
  patients: PatientRepository;
};
