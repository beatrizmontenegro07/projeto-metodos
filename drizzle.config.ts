import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Lê os mesmos arquivos .env* que o Next.js, para que o drizzle-kit migre o mesmo banco que a aplicação usa.
loadEnvConfig(process.cwd());

export default defineConfig({
  dialect: "turso",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
});
