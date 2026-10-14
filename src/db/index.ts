import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

import * as schema from "./schema";

/** URL que escolhe o armazenamento em RAM: os dados existem só enquanto o processo roda. */
export const URL_DO_BANCO_EM_MEMORIA = ":memory:";
const PASTA_DE_MIGRACOES = "drizzle";

export type BancoDeDados = ReturnType<typeof conectar>;

function conectar(url: string, authToken?: string) {
  return drizzle({ connection: { url, authToken }, schema });
}

export async function aplicarMigracoes(bancoDeDados: BancoDeDados): Promise<void> {
  await migrate(bancoDeDados, { migrationsFolder: PASTA_DE_MIGRACOES });
}

export async function criarBancoDeDados(url: string, authToken?: string): Promise<BancoDeDados> {
  const bancoDeDados = conectar(url, authToken);
  // Bancos permanentes (arquivo local ou Turso) são migrados por `npm run db:migrate`;
  // o banco em memória nasce vazio a cada execução e precisa do esquema na hora.
  if (url === URL_DO_BANCO_EM_MEMORIA) await aplicarMigracoes(bancoDeDados);
  return bancoDeDados;
}

const escopoGlobal = globalThis as typeof globalThis & {
  bancoDeDadosDaAplicacao?: Promise<BancoDeDados>;
};

/**
 * Conexão única do processo. O mecanismo de armazenamento é escolhido na
 * inicialização pela DATABASE_URL. Fica em globalThis para que o hot reload
 * do `next dev` não descarte o banco em memória.
 */
export function obterBancoDeDados(): Promise<BancoDeDados> {
  escopoGlobal.bancoDeDadosDaAplicacao ??= criarBancoDeDados(
    lerUrlDoBanco(),
    process.env.DATABASE_AUTH_TOKEN,
  );
  return escopoGlobal.bancoDeDadosDaAplicacao;
}

function lerUrlDoBanco(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não definida. Copie .env.sample para .env.local.");
  return url;
}
