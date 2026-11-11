import { InMemoryPatientRepository } from "./patients/in-memory-patient-repository";
import type { RepositoryFactory } from "./repository-factory";
import { InMemoryUserRepository } from "./users/in-memory-user-repository";

/** Concrete factory for a family backed by RAM collections. */
export class InMemoryRepositoryFactory implements RepositoryFactory {
  createUserRepository(): InMemoryUserRepository {
    return new InMemoryUserRepository();
  }

  createPatientRepository(): InMemoryPatientRepository {
    return new InMemoryPatientRepository();
  }
}
