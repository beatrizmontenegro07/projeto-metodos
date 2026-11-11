import type { NextRequest } from "next/server";
import { ReportValidationError } from "@/modules/access-reports/errors";
import { type ApiContext, errorResponse, HTTP_BAD_REQUEST, respondAsSignedInUser, translatorFor } from "../api-responses";

export function createAccessReportsHandler(context: ApiContext) {
  return (request: NextRequest) => respondAsSignedInUser(request, context, async (facade, actor) => {
    const t = await translatorFor(request);
    const query = request.nextUrl.searchParams;
    const report = await facade.generateAccessReport(actor, {
      start: query.get("start") ?? "", end: query.get("end") ?? "", format: query.get("format") ?? "",
    }, {
      title: t("reports.title"), period: t("reports.period"), userId: t("reports.columns.userId"),
      count: t("reports.columns.count"), lastAccess: t("reports.columns.lastAccess"), total: t("reports.total"),
    });
    return new Response(report.content, { headers: {
      "Content-Type": report.mediaType,
      "Content-Disposition": `attachment; filename="access-report.${report.extension}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    } });
  }, (error, t) => error instanceof ReportValidationError
    ? errorResponse(HTTP_BAD_REQUEST, error.code, t(`reports.errors.${error.code}`)) : undefined);
}
