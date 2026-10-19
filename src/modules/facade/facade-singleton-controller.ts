import { AuthenticationController, type SignInCredentials } from "@/modules/auth/authentication-controller";
import { AccessDeniedError } from "@/modules/auth/errors";
import { hasPermission, type Permission } from "@/modules/auth/permissions";
import type { Patient, PatientInput, PatientSearch } from "@/modules/patients/patient";
import { PatientController } from "@/modules/patients/patient-controller";
import type { NewUser, User } from "@/modules/users/user";
import { UserController } from "@/modules/users/user-controller";

import type { Repositories } from "./repositories";

/** RF15: the totals the actor may see; a total outside the actor's permissions is absent. */
export type RegisteredEntityCounts = {
  users?: number;
  patients?: number;
};

/**
 * The single entry point of the business layer (Facade + Singleton, ADR-0007). Screens and API
 * routes call only this class: it hides the controllers, and every operation on behalf of a
 * signed-in user checks that user's role (NF-SEG-02) before delegating.
 */
export class FacadeSingletonController {
  private static instance?: Promise<FacadeSingletonController>;

  private readonly users: UserController;
  private readonly authentication: AuthenticationController;
  private readonly patients: PatientController;

  private constructor(repositories: Repositories) {
    this.users = new UserController(repositories.users);
    this.authentication = new AuthenticationController(repositories.users);
    this.patients = new PatientController(repositories.patients);
  }

  /**
   * Returns the only instance, creating it on the first call. The business layer cannot import
   * the storage mechanisms, so the caller supplies them; later calls ignore `loadRepositories`.
   */
  static getInstance(loadRepositories: () => Promise<Repositories>): Promise<FacadeSingletonController> {
    FacadeSingletonController.instance ??= loadRepositories().then(
      (repositories) => new FacadeSingletonController(repositories),
    );
    return FacadeSingletonController.instance;
  }

  signIn(credentials: SignInCredentials): Promise<User> {
    return this.authentication.signIn(credentials);
  }

  /** Looks up the user of a session; no permission applies. */
  findUser(id: number): Promise<User | undefined> {
    return this.users.findById(id);
  }

  hasUsers(): Promise<boolean> {
    return this.users.hasUsers();
  }

  createFirstAdministrator(newUser: Omit<NewUser, "role">): Promise<User> {
    return this.users.addFirstAdministrator(newUser);
  }

  async addUser(actor: User, newUser: NewUser): Promise<User> {
    this.authorize(actor, "MANAGE_USERS");
    return this.users.add(newUser);
  }

  async listUsers(actor: User): Promise<User[]> {
    this.authorize(actor, "MANAGE_USERS");
    return this.users.list();
  }

  async addPatient(actor: User, input: PatientInput): Promise<Patient> {
    this.authorize(actor, "MANAGE_PATIENTS");
    return this.patients.add(input, actor.id);
  }

  async updatePatient(actor: User, id: number, input: PatientInput): Promise<Patient> {
    this.authorize(actor, "MANAGE_PATIENTS");
    return this.patients.update(id, input);
  }

  async deactivatePatient(actor: User, id: number): Promise<Patient> {
    this.authorize(actor, "MANAGE_PATIENTS");
    return this.patients.deactivate(id);
  }

  async reactivatePatient(actor: User, id: number): Promise<Patient> {
    this.authorize(actor, "MANAGE_PATIENTS");
    return this.patients.reactivate(id);
  }

  async getPatient(actor: User, id: number): Promise<Patient> {
    this.authorize(actor, "MANAGE_PATIENTS");
    return this.patients.get(id);
  }

  async searchPatients(actor: User, search: PatientSearch): Promise<Patient[]> {
    this.authorize(actor, "MANAGE_PATIENTS");
    return this.patients.search(search);
  }

  /** How many entities are registered, limited to the areas the actor can access. */
  async countRegisteredEntities(actor: User): Promise<RegisteredEntityCounts> {
    const [users, patients] = await Promise.all([
      hasPermission(actor.role, "MANAGE_USERS") ? this.users.count() : undefined,
      hasPermission(actor.role, "MANAGE_PATIENTS") ? this.patients.count() : undefined,
    ]);
    return { ...(users === undefined ? {} : { users }), ...(patients === undefined ? {} : { patients }) };
  }

  private authorize(actor: User, permission: Permission): void {
    if (!hasPermission(actor.role, permission)) throw new AccessDeniedError(permission);
  }
}
