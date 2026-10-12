const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { Papel } = require('../src/domain/papel');
const { ControladorDeUsuarios } = require('../src/application/controlador-de-usuarios');
const { criarRepositorioDeUsuarios } = require('../src/infra/fabrica-de-repositorio-de-usuarios');

const usuarioValido = (overrides = {}) => ({
  nome: 'Ana Silva', email: 'ana@clinicore.com', login: 'ana', senha: 'Senha@123',
  papel: Papel.RECEPCIONISTA, ...overrides,
});

test('deve recusar login vazio, com números ou acima de 12 caracteres', () => {
  for (const login of ['', 'ana1', 'abcdefghijklmn']) {
    assert.throws(() => new ControladorDeUsuarios().adicionar(usuarioValido({ login })), /login/i);
  }
});

test('deve recusar senha fora da política padrão do IAM', () => {
  const invalidas = ['Senha1', 'somenteletras', 'SOMENTELETRAS1', 'SenhaSemTipo', 'a'.repeat(129), 'ana'];
  for (const senha of invalidas) {
    assert.throws(() => new ControladorDeUsuarios().adicionar(usuarioValido({ senha })), /senha/i);
  }
});

test('deve aceitar senha entre 8 e 128 caracteres com três tipos diferentes', () => {
  const usuario = new ControladorDeUsuarios().adicionar(usuarioValido({ senha: 'Senha123' }));
  assert.equal(usuario.login, 'ana');
  assert.equal(Object.hasOwn(usuario, 'senha'), false);
});

test('deve persistir usuários em arquivo binário quando este modo é escolhido', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'clinicore-'));
  const arquivo = path.join(directory, 'usuarios.bin');
  const primeiro = new ControladorDeUsuarios(criarRepositorioDeUsuarios({ modo: 'arquivo', arquivo }));
  primeiro.adicionar(usuarioValido());
  const segundo = new ControladorDeUsuarios(criarRepositorioDeUsuarios({ modo: 'arquivo', arquivo }));
  assert.equal(segundo.listar().length, 1);
  fs.rmSync(directory, { recursive: true, force: true });
});

test('deve permitir selecionar memória ou arquivo na inicialização', () => {
  assert.equal(criarRepositorioDeUsuarios({ modo: 'memoria' }).tipo, 'memoria');
  assert.equal(criarRepositorioDeUsuarios({ modo: 'arquivo', arquivo: '/tmp/users.bin' }).tipo, 'arquivo');
});
