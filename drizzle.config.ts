import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Read the same .env* files as Next.js, so drizzle-kit migrates the database the app uses.
loadEnvConfig(process.cwd());

export default defineConfig({
  dialect: "turso",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
    // An empty token (as in .env.sample) would make drizzle-kit demand one even for a local file.
    authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  },
});
