import { ErroDeValidacaoDeUsuario } from "./erros";
import { ehPapelValido } from "./papel";

const TAMANHO_MAXIMO_DO_LOGIN = 12;
const TAMANHO_MINIMO_DA_SENHA = 8;
const TAMANHO_MAXIMO_DA_SENHA = 128;
const QUANTIDADE_MINIMA_DE_TIPOS_DE_CARACTERE = 3;

// Política padrão do AWS IAM: minúscula, maiúscula, número e símbolo.
const TIPOS_DE_CARACTERE = [/\p{Ll}/u, /\p{Lu}/u, /\d/u, /[^\p{L}\d]/u];

export function validarPapel(papel: unknown): void {
  if (!ehPapelValido(papel)) throw new ErroDeValidacaoDeUsuario("O papel do usuário é inválido.");
}

export function validarLogin(login: unknown): void {
  if (typeof login !== "string" || login.length === 0 || login.length > TAMANHO_MAXIMO_DO_LOGIN || /\d/.test(login)) {
    throw new ErroDeValidacaoDeUsuario("O login não pode ser vazio, ter números ou mais de 12 caracteres.");
  }
}

export function validarSenha(senha: unknown, { login, email }: { login: string; email: string }): void {
  if (
    typeof senha !== "string" ||
    senha.length < TAMANHO_MINIMO_DA_SENHA ||
    senha.length > TAMANHO_MAXIMO_DA_SENHA ||
    senha === login ||
    senha === email
  ) {
    throw new ErroDeValidacaoDeUsuario("A senha não atende à política do IAM.");
  }
  const tiposPresentes = TIPOS_DE_CARACTERE.filter((tipo) => tipo.test(senha));
  if (tiposPresentes.length < QUANTIDADE_MINIMA_DE_TIPOS_DE_CARACTERE) {
    throw new ErroDeValidacaoDeUsuario("A senha deve conter pelo menos três tipos de caracteres.");
  }
}
