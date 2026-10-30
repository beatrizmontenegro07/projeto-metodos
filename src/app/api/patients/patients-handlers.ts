import type { NextRequest } from "next/server";

import {
  DuplicatePatientError,
  PatientNotFoundError,
  PatientValidationError,
} from "@/modules/patients/errors";
import { isPatientStatusFilter, PATIENT_STATUS_FILTERS, type PatientInput } from "@/modules/patients/patient";

import {
  type ApiContext,
  apiErrorResponse,
  errorResponse,
  HTTP_BAD_REQUEST,
  HTTP_CONFLICT,
  HTTP_CREATED,
  HTTP_NOT_FOUND,
  invalidBodyResponse,
  readTextFields,
  respondAsSignedInUser,
  type Translate,
} from "../api-responses";

const PATIENT_REQUIRED_FIELDS = ["name", "cpf", "birthDate", "gender", "phone", "legalBasis"] as const;
const PATIENT_OPTIONAL_FIELDS = ["email", "address"] as const;
const PATIENT_FIELDS = [...PATIENT_REQUIRED_FIELDS, ...PATIENT_OPTIONAL_FIELDS];
const STATUS_FIELD = "active";
const DEFAULT_STATUS_FILTER = "all";
const PATIENT_ID = /^[1-9]\d*$/;

/**
 * The boundary of patient management (UC01, UC07, UC08, UC09): turns HTTP requests into facade
 * calls on behalf of the signed-in user, and failures into `{ error: { code, message } }`.
 * Ids arrive as text from the URL; one that is not a positive integer names no patient (404).
 */
export function createPatientsHandlers(context: ApiContext) {
  return {
    search(request: NextRequest): Promise<Response> {
      return respondAsSignedInUser(
        request,
        context,
        async (facade, actor) => {
          const { searchParams } = request.nextUrl;
          const status = searchParams.get("status") ?? DEFAULT_STATUS_FILTER;
          if (!isPatientStatusFilter(status)) {
            return apiErrorResponse(request, HTTP_BAD_REQUEST, "INVALID_QUERY", {
              parameter: "status",
              values: PATIENT_STATUS_FILTERS.join(", "),
            });
          }
          const text = searchParams.get("search") ?? "";
          return Response.json(await facade.searchPatients(actor, { text, status }));
        },
        patientErrorResponse,
      );
    },

    add(request: NextRequest): Promise<Response> {
      return respondAsSignedInUser(
        request,
        context,
        async (facade, actor) => {
          const input = await readPatientInput(request);
          if (!input) return invalidBodyResponse(request, PATIENT_FIELDS);
          return Response.json(await facade.addPatient(actor, input), { status: HTTP_CREATED });
        },
        patientErrorResponse,
      );
    },

    get(request: NextRequest, id: string): Promise<Response> {
      return respondAsSignedInUser(
        request,
        context,
        async (facade, actor) => Response.json(await facade.getPatient(actor, toPatientId(id))),
        patientErrorResponse,
      );
    },

    update(request: NextRequest, id: string): Promise<Response> {
      return respondAsSignedInUser(
        request,
        context,
        async (facade, actor) => {
          const input = await readPatientInput(request);
          if (!input) return invalidBodyResponse(request, PATIENT_FIELDS);
          return Response.json(await facade.updatePatient(actor, toPatientId(id), input));
        },
        patientErrorResponse,
      );
    },

    /** RF13: `{ "active": false }` inactivates the patient and `{ "active": true }` reactivates it. */
    changeStatus(request: NextRequest, id: string): Promise<Response> {
      return respondAsSignedInUser(
        request,
        context,
        async (facade, actor) => {
          const active = await readActiveFlag(request);
          if (active === undefined) return invalidBodyResponse(request, [STATUS_FIELD]);
          const patientId = toPatientId(id);
          const patient = active
            ? await facade.reactivatePatient(actor, patientId)
            : await facade.deactivatePatient(actor, patientId);
          return Response.json(patient);
        },
        patientErrorResponse,
      );
    },
  };
}

function readPatientInput(request: NextRequest): Promise<PatientInput | undefined> {
  return readTextFields(request, PATIENT_REQUIRED_FIELDS, PATIENT_OPTIONAL_FIELDS);
}

async function readActiveFlag(request: NextRequest): Promise<boolean | undefined> {
  const body: unknown = await request.json().catch(() => undefined);
  const active = (body as Record<string, unknown> | null | undefined)?.[STATUS_FIELD];
  return typeof active === "boolean" ? active : undefined;
}

function toPatientId(id: string): number {
  if (!PATIENT_ID.test(id)) throw new PatientNotFoundError(Number.NaN);
  return Number(id);
}

function patientErrorResponse(error: unknown, translate: Translate): Response | undefined {
  if (error instanceof PatientNotFoundError) {
    return errorResponse(HTTP_NOT_FOUND, error.code, translate(`patients.errors.${error.code}`));
  }
  if (!(error instanceof PatientValidationError)) return undefined;
  const status = error instanceof DuplicatePatientError ? HTTP_CONFLICT : HTTP_BAD_REQUEST;
  return errorResponse(status, error.code, translate(`patients.errors.${error.code}`));
}
