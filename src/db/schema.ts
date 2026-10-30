import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Relative paths: drizzle-kit loads this file without resolving the "@/" alias.
import { GENDERS } from "../modules/patients/gender";
import { LEGAL_BASES } from "../modules/patients/legal-basis";
import { ROLES } from "../modules/users/role";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  login: text("login").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ROLES }).notNull(),
});

export const patients = sqliteTable(
  "patients",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    // The name in lowercase without accents (toSearchKey), for accent-insensitive search and sorting.
    searchName: text("search_name").notNull(),
    cpf: text("cpf").notNull().unique(),
    birthDate: text("birth_date").notNull(),
    gender: text("gender", { enum: GENDERS }).notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    address: text("address"),
    legalBasis: text("legal_basis", { enum: LEGAL_BASES }).notNull(),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdBy: integer("created_by")
      .notNull()
      .references(() => users.id),
  },
  (table) => [index("patients_search_name_index").on(table.searchName)],
);
