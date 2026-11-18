import type { AccessRecordRepository } from "@/modules/access-records/access-record-repository";
import { createAccessReport, type ReportFile, type ReportInput, type ReportLabels } from "@/modules/access-reports/access-report";
import { hasPermission } from "@/modules/auth/permissions";
import type { PatientController } from "@/modules/patients/patient-controller";
import type { Role } from "@/modules/users/role";
import type { UserController } from "@/modules/users/user-controller";

import type { Command } from "./command";

/** RF18: the receiver is the access report Template Method over the access records. */
export class GenerateAccessReportCommand implements Command<ReportFile> {
  constructor(
    private readonly accessRecords: AccessRecordRepository,
    private readonly input: ReportInput,
    private readonly labels: ReportLabels,
  ) {}

  execute(): Promise<ReportFile> {
    return createAccessReport(this.accessRecords, this.input, this.labels);
  }
}

/** RF15: the totals the role may see; a total outside the role's permissions is absent. */
export type RegisteredEntityCounts = {
  users?: number;
  patients?: number;
};

/** RF15: the receivers are `UserController` and `PatientController`. */
export class CountRegisteredEntitiesCommand implements Command<RegisteredEntityCounts> {
  constructor(
    private readonly users: UserController,
    private readonly patients: PatientController,
    private readonly role: Role,
  ) {}

  async execute(): Promise<RegisteredEntityCounts> {
    const [users, patients] = await Promise.all([
      hasPermission(this.role, "MANAGE_USERS") ? this.users.count() : undefined,
      hasPermission(this.role, "MANAGE_PATIENTS") ? this.patients.count() : undefined,
    ]);
    return { ...(users === undefined ? {} : { users }), ...(patients === undefined ? {} : { patients }) };
  }
}
