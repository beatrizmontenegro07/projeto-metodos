import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Caminho relativo: o drizzle-kit carrega este arquivo sem o alias "@/".
import { PAPEIS } from "../modules/usuarios/papel";

export const usuarios = sqliteTable("usuarios", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  login: text("login").notNull().unique(),
  senhaHash: text("senha_hash").notNull(),
  papel: text("papel", { enum: PAPEIS }).notNull(),
});
