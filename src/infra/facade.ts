import { FacadeSingletonController } from "@/modules/facade/facade-singleton-controller";
import type { Repositories } from "@/modules/facade/repositories";

import { getPatientRepository } from "./patients/patient-repository-factory";
import { getUserRepository } from "./users/user-repository-factory";

async function loadRepositories(): Promise<Repositories> {
  const [users, patients] = await Promise.all([getUserRepository(), getPatientRepository()]);
  return { users, patients };
}

/** Where the application is assembled: the facade receives the repositories chosen by STORAGE. */
export function getFacade(): Promise<FacadeSingletonController> {
  return FacadeSingletonController.getInstance(loadRepositories);
}
