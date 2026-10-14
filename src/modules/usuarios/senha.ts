import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";

const derivarChave = promisify(scrypt) as (senha: string, salt: string, tamanho: number) => Promise<Buffer>;

const TAMANHO_DO_SALT_EM_BYTES = 16;
const TAMANHO_DA_CHAVE_EM_BYTES = 64;

/**
 * Gera o valor guardado em `usuarios.senha_hash`, no formato `<salt hex>:<chave scrypt hex>`.
 * A verificação da senha no login precisa derivar a chave com o mesmo salt e tamanho.
 */
export async function gerarHashDeSenha(senha: string): Promise<string> {
  const salt = randomBytes(TAMANHO_DO_SALT_EM_BYTES).toString("hex");
  const chave = await derivarChave(senha, salt, TAMANHO_DA_CHAVE_EM_BYTES);
  return `${salt}:${chave.toString("hex")}`;
}
