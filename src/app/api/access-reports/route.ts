import { connection, type NextRequest } from "next/server";
import { getRequestUser } from "@/infra/auth/session";
import { getFacade } from "@/infra/facade";
import { createAccessReportsHandler } from "./access-reports-handlers";

const download = createAccessReportsHandler({ getFacade, authenticate: getRequestUser });
export async function GET(request: NextRequest) {
  await connection();
  return download(request);
}
