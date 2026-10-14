import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Relative path: drizzle-kit loads this file without resolving the "@/" alias.
import { ROLES } from "../modules/users/role";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  login: text("login").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ROLES }).notNull(),
});
