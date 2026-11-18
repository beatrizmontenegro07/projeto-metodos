import type { ReportFile, ReportInput, ReportLabels } from "@/modules/access-reports/access-report";
import type { AccessLogger } from "@/modules/auth/access-logger";
import { AuthenticationController, type SignInCredentials } from "@/modules/auth/authentication-controller";
import { AccessDeniedError } from "@/modules/auth/errors";
import { hasPermission, type Permission } from "@/modules/auth/permissions";
import type { Patient, PatientInput, PatientSearch } from "@/modules/patients/patient";
import { PatientController } from "@/modules/patients/patient-controller";
import { PatientUpdateHistory } from "@/modules/patients/patient-memento";
import type { NewUser, User } from "@/modules/users/user";
import { UserController } from "@/modules/users/user-controller";

import { SignInCommand } from "./commands/auth-commands";
import { CommandInvoker } from "./commands/command-invoker";
import {
  AddPatientCommand,
  CanUndoPatientUpdateCommand,
  DeactivatePatientCommand,
  GetPatientCommand,
  ReactivatePatientCommand,
  SearchPatientsCommand,
  UndoPatientUpdateCommand,
  UpdatePatientCommand,
} from "./commands/patient-commands";
import { CountRegisteredEntitiesCommand, GenerateAccessReportCommand, type RegisteredEntityCounts } from "./commands/report-commands";
import {
  AddUserCommand,
  CreateFirstAdministratorCommand,
  FindUserCommand,
  HasUsersCommand,
  ListUsersCommand,
} from "./commands/user-commands";
import type { Repositories } from "./repositories";

export type { RegisteredEntityCounts } from "./commands/report-commands";

/**
 * The single entry point of the business layer (Facade + Singleton, ADR-0007). Screens and API
 * routes call only this class: it hides the controllers, and every operation on behalf of a
 * signed-in user checks that user's role (NF-SEG-02) before delegating.
 *
 * Since Sprint 5 the facade is the client of the Command pattern (ADR-0012): each method builds
 * a concrete command bound to its receiver (a controller) and runs it through the
 * `CommandInvoker`. It also owns the caretaker of the patient mementos (ADR-0013), so the last
 * update of a patient can be undone.
 */
export class FacadeSingletonController {
  private static instance?: Promise<FacadeSingletonController>;

  private readonly users: UserController;
  private readonly authentication: AuthenticationController;
  private readonly patients: PatientController;
  private readonly accessRecords: Repositories["accesses"];
  private readonly invoker = new CommandInvoker();
  private readonly patientUpdates = new PatientUpdateHistory();

  private constructor(repositories: Repositories, logger: AccessLogger) {
    this.users = new UserController(repositories.users);
    this.authentication = new AuthenticationController(repositories.users, logger, repositories.accesses);
    this.patients = new PatientController(repositories.patients);
    this.accessRecords = repositories.accesses;
  }

  /**
   * Returns the only instance, creating it on the first call. The business layer cannot import
   * storage or logging implementations, so the caller supplies them; later calls reuse both.
   */
  static getInstance(
    loadRepositories: () => Promise<Repositories>,
    logger: AccessLogger,
  ): Promise<FacadeSingletonController> {
    FacadeSingletonController.instance ??= loadRepositories().then(
      (repositories) => new FacadeSingletonController(repositories, logger),
    );
    return FacadeSingletonController.instance;
  }

  signIn(credentials: SignInCredentials): Promise<User> {
    return this.invoker.execute(new SignInCommand(this.authentication, credentials));
  }

  async generateAccessReport(actor: User, input: ReportInput, labels: ReportLabels): Promise<ReportFile> {
    this.authorize(actor, "GENERATE_ACCESS_REPORTS");
    return this.invoker.execute(new GenerateAccessReportCommand(this.accessRecords, input, labels));
  }

  /** Looks up the user of a session; no permission applies. */
  findUser(id: number): Promise<User | undefined> {
    return this.invoker.execute(new FindUserCommand(this.users, id));
  }

  hasUsers(): Promise<boolean> {
    return this.invoker.execute(new HasUsersCommand(this.users));
  }

  createFirstAdministrator(newUser: Omit<NewUser, "role">): Promise<User> {
    return this.invoker.execute(new CreateFirstAdministratorCommand(this.users, newUser));
  }

  async addUser(actor: User, newUser: NewUser): Promise<User> {
    this.authorize(actor, "MANAGE_USERS");
    return this.invoker.execute(new AddUserCommand(this.users, newUser));
  }

  async listUsers(actor: User): Promise<User[]> {
    this.authorize(actor, "MANAGE_USERS");
    return this.invoker.execute(new ListUsersCommand(this.users));
  }

  async addPatient(actor: User, input: PatientInput): Promise<Patient> {
    this.authorize(actor, "MANAGE_PATIENTS");
    return this.invoker.execute(new AddPatientCommand(this.patients, input, actor.id));
  }

  /** RF12; the replaced data is kept so that RF19 can undo this update. */
  async updatePatient(actor: User, id: number, input: PatientInput): Promise<Patient> {
    this.authorize(actor, "MANAGE_PATIENTS");
    return this.invoker.execute(new UpdatePatientCommand(this.patients, this.patientUpdates, id, input));
  }

  /** RF19: puts back the patient's data from before their last update. */
  async undoPatientUpdate(actor: User, id: number): Promise<Patient> {
    this.authorize(actor, "MANAGE_PATIENTS");
    return this.invoker.execute(new UndoPatientUpdateCommand(this.patients, this.patientUpdates, id));
  }

  async canUndoPatientUpdate(actor: User, id: number): Promise<boolean> {
    this.authorize(actor, "MANAGE_PATIENTS");
    return this.invoker.execute(new CanUndoPatientUpdateCommand(this.patientUpdates, id));
  }

  async deactivatePatient(actor: User, id: number): Promise<Patient> {
    this.authorize(actor, "MANAGE_PATIENTS");
    return this.invoker.execute(new DeactivatePatientCommand(this.patients, id));
  }

  async reactivatePatient(actor: User, id: number): Promise<Patient> {
    this.authorize(actor, "MANAGE_PATIENTS");
    return this.invoker.execute(new ReactivatePatientCommand(this.patients, id));
  }

  async getPatient(actor: User, id: number): Promise<Patient> {
    this.authorize(actor, "MANAGE_PATIENTS");
    return this.invoker.execute(new GetPatientCommand(this.patients, id));
  }

  async searchPatients(actor: User, search: PatientSearch): Promise<Patient[]> {
    this.authorize(actor, "MANAGE_PATIENTS");
    return this.invoker.execute(new SearchPatientsCommand(this.patients, search));
  }

  /** How many entities are registered, limited to the areas the actor can access. */
  countRegisteredEntities(actor: User): Promise<RegisteredEntityCounts> {
    return this.invoker.execute(new CountRegisteredEntitiesCommand(this.users, this.patients, actor.role));
  }

  private authorize(actor: User, permission: Permission): void {
    if (!hasPermission(actor.role, permission)) throw new AccessDeniedError(permission);
  }
}
