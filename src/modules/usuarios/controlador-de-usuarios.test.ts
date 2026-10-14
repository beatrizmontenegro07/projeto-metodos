import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { aplicarMigracoes, criarBancoDeDados, URL_DO_BANCO_EM_MEMORIA } from "@/db";
import { usuarios } from "@/db/schema";

import { ControladorDeUsuarios } from "./controlador-de-usuarios";
import { ErroDePersistenciaDeUsuarios, ErroDeValidacaoDeUsuario } from "./erros";
import type { Papel } from "./papel";
import type { DadosDeNovoUsuario } from "./usuario";

function usuarioValido(alteracoes: Partial<DadosDeNovoUsuario> = {}): DadosDeNovoUsuario {
  return {
    nome: "Ana Silva",
    email: "ana@clinicore.com",
    login: "ana",
    senha: "Senha@123",
    papel: "RECEPCIONISTA",
    ...alteracoes,
  };
}

async function criarControladorEmMemoria() {
  return new ControladorDeUsuarios(await criarBancoDeDados(URL_DO_BANCO_EM_MEMORIA));
}

describe("cadastro e listagem de usuários", () => {
  let controlador: ControladorDeUsuarios;

  beforeEach(async () => {
    controlador = await criarControladorEmMemoria();
  });

  it("adiciona um usuário com papel definido e identificador único", async () => {
    const usuario = await controlador.adicionar(usuarioValido());

    expect(usuario).toEqual({
      id: 1,
      nome: "Ana Silva",
      email: "ana@clinicore.com",
      login: "ana",
      papel: "RECEPCIONISTA",
    });
  });

  it("rejeita e-mail duplicado sem cadastrar um segundo usuário", async () => {
    await controlador.adicionar(usuarioValido());

    await expect(
      controlador.adicionar(usuarioValido({ nome: "Outra Ana", login: "outra", papel: "MEDICO" })),
    ).rejects.toThrow(new ErroDeValidacaoDeUsuario("Já existe um usuário cadastrado com este e-mail."));
    expect(await controlador.listar()).toHaveLength(1);
  });

  it("rejeita login duplicado sem cadastrar um segundo usuário", async () => {
    await controlador.adicionar(usuarioValido());

    await expect(
      controlador.adicionar(usuarioValido({ email: "outra@clinicore.com" })),
    ).rejects.toThrow(new ErroDeValidacaoDeUsuario("Já existe um usuário cadastrado com este login."));
    expect(await controlador.listar()).toHaveLength(1);
  });

  it("rejeita usuário com papel que não faz parte dos papéis permitidos", async () => {
    await expect(
      controlador.adicionar(usuarioValido({ papel: "GERENTE" as Papel })),
    ).rejects.toThrow(new ErroDeValidacaoDeUsuario("O papel do usuário é inválido."));
  });

  it("lista todos os usuários em ordem de cadastro", async () => {
    await controlador.adicionar(usuarioValido());
    await controlador.adicionar(
      usuarioValido({ nome: "Dr. Bruno Lima", email: "bruno@clinicore.com", login: "bruno", papel: "MEDICO" }),
    );

    const listagem = await controlador.listar();

    expect(listagem.map(({ id, nome, papel }) => ({ id, nome, papel }))).toEqual([
      { id: 1, nome: "Ana Silva", papel: "RECEPCIONISTA" },
      { id: 2, nome: "Dr. Bruno Lima", papel: "MEDICO" },
    ]);
  });

  it("não permite alterar um usuário por meio do valor retornado ao adicioná-lo", async () => {
    const usuario = await controlador.adicionar(usuarioValido());

    usuario.email = "outro@clinicore.com";
    usuario.papel = "ADMINISTRADOR";

    const [usuarioArmazenado] = await controlador.listar();
    expect(usuarioArmazenado.email).toBe("ana@clinicore.com");
    expect(usuarioArmazenado.papel).toBe("RECEPCIONISTA");
  });

  it("não permite alterar um usuário por meio de uma listagem", async () => {
    await controlador.adicionar(usuarioValido());

    const [usuario] = await controlador.listar();
    usuario.papel = "ADMINISTRADOR";

    expect((await controlador.listar())[0].papel).toBe("RECEPCIONISTA");
  });
});

describe("regras de login", () => {
  it.each([
    ["deve recusar login vazio", ""],
    ["deve recusar login com números", "ana1"],
    ["deve recusar login com mais de 12 caracteres", "abcdefghijklm"],
  ])("%s", async (_cenario, login) => {
    const controlador = await criarControladorEmMemoria();

    await expect(controlador.adicionar(usuarioValido({ login }))).rejects.toThrow(
      new ErroDeValidacaoDeUsuario("O login não pode ser vazio, ter números ou mais de 12 caracteres."),
    );
  });

  it("deve aceitar login com exatamente 12 caracteres", async () => {
    const controlador = await criarControladorEmMemoria();

    const usuario = await controlador.adicionar(usuarioValido({ login: "abcdefghijkl" }));

    expect(usuario.login).toBe("abcdefghijkl");
  });
});

describe("regras de senha (política padrão do AWS IAM)", () => {
  const MENSAGEM_DE_POLITICA = "A senha não atende à política do IAM.";
  const MENSAGEM_DE_TIPOS = "A senha deve conter pelo menos três tipos de caracteres.";

  it.each<[cenario: string, senha: string, mensagem: string, alteracoes?: Partial<DadosDeNovoUsuario>]>([
    ["deve recusar senha com menos de 8 caracteres", "Senha1", MENSAGEM_DE_POLITICA],
    ["deve recusar senha com mais de 128 caracteres", `Aa1${"a".repeat(126)}`, MENSAGEM_DE_POLITICA],
    ["deve recusar senha igual ao login", "Senha@Forte", MENSAGEM_DE_POLITICA, { login: "Senha@Forte" }],
    ["deve recusar senha igual ao e-mail", "Ana@clinicore.com1", MENSAGEM_DE_POLITICA, { email: "Ana@clinicore.com1" }],
    ["deve recusar senha só com letras minúsculas", "somenteletras", MENSAGEM_DE_TIPOS],
    ["deve recusar senha com apenas dois tipos de caractere", "SOMENTELETRAS1", MENSAGEM_DE_TIPOS],
  ])("%s", async (_cenario, senha, mensagem, alteracoes = {}) => {
    const controlador = await criarControladorEmMemoria();

    await expect(
      controlador.adicionar(usuarioValido({ ...alteracoes, senha })),
    ).rejects.toThrow(new ErroDeValidacaoDeUsuario(mensagem));
  });

  it("deve aceitar senha entre 8 e 128 caracteres com três tipos diferentes", async () => {
    const controlador = await criarControladorEmMemoria();

    const usuario = await controlador.adicionar(usuarioValido({ senha: "Senha123" }));

    expect(usuario.login).toBe("ana");
  });

  it("nunca expõe nem persiste a senha em texto puro", async () => {
    const bancoDeDados = await criarBancoDeDados(URL_DO_BANCO_EM_MEMORIA);
    const controlador = new ControladorDeUsuarios(bancoDeDados);

    const usuario = await controlador.adicionar(usuarioValido());
    const [registro] = await bancoDeDados.select().from(usuarios);

    expect(usuario).not.toHaveProperty("senha");
    expect(usuario).not.toHaveProperty("senhaHash");
    expect(await controlador.listar()).not.toContainEqual(expect.objectContaining({ senhaHash: expect.anything() }));
    expect(registro.senhaHash).not.toContain("Senha@123");
  });
});

describe("mecanismo de armazenamento escolhido na inicialização", () => {
  let pastaTemporaria: string;

  beforeEach(() => {
    pastaTemporaria = mkdtempSync(join(tmpdir(), "clinicore-"));
  });

  afterEach(() => {
    rmSync(pastaTemporaria, { recursive: true, force: true });
  });

  it("deve manter os usuários apenas em memória quando a URL é :memory:", async () => {
    await (await criarControladorEmMemoria()).adicionar(usuarioValido());

    const novaExecucao = await criarControladorEmMemoria();

    expect(await novaExecucao.listar()).toEqual([]);
  });

  it("deve persistir usuários entre execuções quando o banco é um arquivo SQLite", async () => {
    const url = `file:${join(pastaTemporaria, "clinicore.db")}`;
    const primeiraExecucao = await criarBancoDeDados(url);
    await aplicarMigracoes(primeiraExecucao);
    await new ControladorDeUsuarios(primeiraExecucao).adicionar(usuarioValido());
    primeiraExecucao.$client.close();

    const segundaExecucao = new ControladorDeUsuarios(await criarBancoDeDados(url));

    expect(await segundaExecucao.listar()).toHaveLength(1);
  });

  it("deve converter falhas do banco em erro de persistência", async () => {
    const bancoSemTabelas = await criarBancoDeDados(`file:${join(pastaTemporaria, "vazio.db")}`);
    const controlador = new ControladorDeUsuarios(bancoSemTabelas);

    await expect(controlador.listar()).rejects.toBeInstanceOf(ErroDePersistenciaDeUsuarios);
  });
});
