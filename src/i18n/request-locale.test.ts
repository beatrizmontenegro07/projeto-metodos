import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { resolveRequestLocale } from "./request-locale";

function request(headers: Record<string, string>) {
  return new NextRequest("http://localhost/api/users", { headers });
}

describe("choosing the language of an API response", () => {
  it.each<[scenario: string, headers: Record<string, string>, locale: string]>([
    ["uses pt-BR when nothing is sent", {}, "pt-BR"],
    ["uses the NEXT_LOCALE cookie first", { cookie: "NEXT_LOCALE=en", "accept-language": "pt-BR" }, "en"],
    ["ignores an unsupported cookie value", { cookie: "NEXT_LOCALE=fr", "accept-language": "en" }, "en"],
    ["matches the browser language exactly", { "accept-language": "pt-BR,pt;q=0.9" }, "pt-BR"],
    ["matches the browser language by its prefix", { "accept-language": "en-US,en;q=0.9" }, "en"],
    ["skips unsupported browser languages", { "accept-language": "fr-FR, es;q=0.8, en;q=0.5" }, "en"],
    ["falls back to pt-BR for unsupported languages", { "accept-language": "fr-FR" }, "pt-BR"],
  ])("%s", (_scenario, headers, locale) => {
    expect(resolveRequestLocale(request(headers))).toBe(locale);
  });
});
