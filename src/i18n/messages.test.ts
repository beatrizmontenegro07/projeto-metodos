import { describe, expect, it } from "vitest";

import { USER_VALIDATION_ERROR_CODES } from "@/modules/users/errors";
import { ROLES } from "@/modules/users/role";

import sourceMessages from "../../messages/en.json";
import { routing } from "./routing";

type Catalog = { [key: string]: string | Catalog };

function flattenKeys(catalog: Catalog, prefix = ""): string[] {
  return Object.entries(catalog).flatMap(([key, value]) =>
    typeof value === "string" ? [`${prefix}${key}`] : flattenKeys(value, `${prefix}${key}.`),
  );
}

async function loadCatalog(locale: string): Promise<Catalog> {
  return (await import(`../../messages/${locale}.json`)).default;
}

describe("message catalogs", () => {
  const sourceKeys = flattenKeys(sourceMessages).sort();

  it.each(routing.locales)("%s has exactly the keys of the English source catalog", async (locale) => {
    expect(flattenKeys(await loadCatalog(locale)).sort()).toEqual(sourceKeys);
  });

  it("translates every user validation error code", () => {
    for (const code of USER_VALIDATION_ERROR_CODES) {
      expect(sourceKeys).toContain(`users.errors.${code}`);
    }
  });

  it("translates every role", () => {
    for (const role of ROLES) {
      expect(sourceKeys).toContain(`users.roles.${role}`);
    }
  });
});
