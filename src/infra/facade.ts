import { FacadeSingletonController } from "@/modules/facade/facade-singleton-controller";

import { getRepositories } from "./repository-factory";

/** Where the application is assembled: the facade receives the repositories chosen by STORAGE. */
export function getFacade(): Promise<FacadeSingletonController> {
  return FacadeSingletonController.getInstance(getRepositories);
}
