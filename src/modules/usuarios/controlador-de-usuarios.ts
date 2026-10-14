import { asc, eq, or } from "drizzle-orm";

import type { BancoDeDados } from "@/db";
import { usuarios } from "@/db/schema";

import { ErroDePersistenciaDeUsuarios, ErroDeValidacaoDeUsuario } from "./erros";
import { validarLogin, validarPapel, validarSenha } from "./regras";
import { gerarHashDeSenha } from "./senha";
import type { DadosDeNovoUsuario, Usuario } from "./usuario";

const COLUNAS_PUBLICAS = {
  id: usuarios.id,
  nome: usuarios.nome,
  email: usuarios.email,
  login: usuarios.login,
  papel: usuarios.papel,
};

export class ControladorDeUsuarios {
  constructor(private readonly bancoDeDados: BancoDeDados) {}

  async adicionar({ nome, email, login, senha, papel }: DadosDeNovoUsuario): Promise<Usuario> {
    validarPapel(papel);
    validarLogin(login);
    validarSenha(senha, { login, email });
    await this.garantirEmailELoginDisponiveis(email, login);

    const senhaHash = await gerarHashDeSenha(senha);
    const [usuario] = await this.acessarArmazenamento(() =>
      this.bancoDeDados
        .insert(usuarios)
        .values({ nome, email, login, senhaHash, papel })
        .returning(COLUNAS_PUBLICAS),
    );
    return usuario;
  }

  listar(): Promise<Usuario[]> {
    return this.acessarArmazenamento(() =>
      this.bancoDeDados.select(COLUNAS_PUBLICAS).from(usuarios).orderBy(asc(usuarios.id)),
    );
  }

  private async garantirEmailELoginDisponiveis(email: string, login: string): Promise<void> {
    const conflitantes = await this.acessarArmazenamento(() =>
      this.bancoDeDados
        .select({ email: usuarios.email, login: usuarios.login })
        .from(usuarios)
        .where(or(eq(usuarios.email, email), eq(usuarios.login, login))),
    );
    if (conflitantes.some((usuario) => usuario.email === email)) {
      throw new ErroDeValidacaoDeUsuario("Já existe um usuário cadastrado com este e-mail.");
    }
    if (conflitantes.some((usuario) => usuario.login === login)) {
      throw new ErroDeValidacaoDeUsuario("Já existe um usuário cadastrado com este login.");
    }
  }

  private async acessarArmazenamento<T>(operacao: () => PromiseLike<T>): Promise<T> {
    try {
      return await operacao();
    } catch (erro) {
      throw new ErroDePersistenciaDeUsuarios("Não foi possível acessar o armazenamento de usuários.", {
        cause: erro,
      });
    }
  }
}
