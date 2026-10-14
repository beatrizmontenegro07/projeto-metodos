import type { Papel } from "./papel";

/** Usuário como é exposto pela aplicação: nunca carrega a senha nem o hash dela. */
export type Usuario = {
  id: number;
  nome: string;
  email: string;
  login: string;
  papel: Papel;
};

export type DadosDeNovoUsuario = Omit<Usuario, "id"> & { senha: string };
