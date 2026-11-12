export const REPORT_ERROR_CODES = ["REPORT_START_INVALID", "REPORT_END_INVALID", "REPORT_PERIOD_NOT_INCREASING", "REPORT_FORMAT_INVALID"] as const;
export abstract class ReportValidationError extends Error {
  abstract readonly code: (typeof REPORT_ERROR_CODES)[number];
}
export class InvalidReportStartError extends ReportValidationError {
  readonly code = "REPORT_START_INVALID";
}
export class InvalidReportEndError extends ReportValidationError {
  readonly code = "REPORT_END_INVALID";
}
export class InvalidReportPeriodError extends ReportValidationError {
  readonly code = "REPORT_PERIOD_NOT_INCREASING";
}
export class InvalidReportFormatError extends ReportValidationError {
  readonly code = "REPORT_FORMAT_INVALID";
}
