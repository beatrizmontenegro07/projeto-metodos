import { FacadeSingletonController } from "@/modules/facade/facade-singleton-controller";

import { PinoAccessLogger } from "./logging/pino-access-logger";
import { getRepositories } from "./repository-factory";

const accessLogger = new PinoAccessLogger();

/** Where the application is assembled: the facade receives the repositories chosen by STORAGE. */
export function getFacade(): Promise<FacadeSingletonController> {
  return FacadeSingletonController.getInstance(getRepositories, accessLogger);
}
