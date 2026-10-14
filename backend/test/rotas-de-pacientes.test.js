const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { Papel } = require('../src/domain/papel');
const { ControladorDeUsuarios } = require('../src/application/controlador-de-usuarios');
const { ControladorDePacientes } = require('../src/application/controlador-de-pacientes');
const { criarRepositorioDeUsuarios } = require('../src/infra/fabrica-de-repositorio-de-usuarios');
const { criarRepositorioDePacientes } = require('../src/infra/fabrica-de-repositorio-de-pacientes');
const { ErroDePacienteNaoEncontrado, ErroDePacienteDuplicado } = require('../src/domain/erros-de-paciente');
const { criarAplicacao } = require('../src/api/criar-aplicacao');

const JWT_SECRET_TESTE = 'segredo-super-seguro-para-testes-clinicore-2026';
const SENHA = 'Senha@123';

const dadosPaciente = (overrides = {}) => ({
  nomeCompleto: 'Carlos Eduardo Santos',
  cpf: '123.456.789-01',
  dataNascimento: '1985-04-12',
  genero: 'male',
  telefones: [{ numero: '(83) 98877-6655', tipo: 'mobile' }],
  email: 'carlos@email.com',
  ...overrides,
});

function cpfDoIndice(indice) {
  return String(indice).padStart(11, '0');
}

async function montarAmbiente() {
  const controladorDeUsuarios = new ControladorDeUsuarios(criarRepositorioDeUsuarios({ modo: 'memoria' }));
  const controladorDePacientes = new ControladorDePacientes(criarRepositorioDePacientes({ modo: 'memoria' }));
  const app = criarAplicacao({ controladorDeUsuarios, controladorDePacientes, jwtSecret: JWT_SECRET_TESTE });

  const usuarios = [
    { login: 'admin', papel: Papel.ADMINISTRADOR },
    { login: 'recepcao', papel: Papel.RECEPCIONISTA },
    { login: 'medico', papel: Papel.MEDICO },
    { login: 'paciente', papel: Papel.PACIENTE },
  ];

  const tokens = {};
  for (const { login, papel } of usuarios) {
    controladorDeUsuarios.adicionar({ nome: login, email: `${login}@clinicore.com`, login, senha: SENHA, papel });
    const resposta = await app.simularRequisicao({
      method: 'POST',
      url: '/api/auth/login',
      body: { login, senha: SENHA },
    });
    tokens[login] = resposta.body.token;
  }

  const comToken = (login) => ({ authorization: `Bearer ${tokens[login]}` });
  return { app, controladorDePacientes, comToken };
}

// ---------------------------------------------------------------------------
// Camada de aplicação
// ---------------------------------------------------------------------------

test('ControladorDePacientes cadastra, edita, remove e impede CPF duplicado', () => {
  const controlador = new ControladorDePacientes(criarRepositorioDePacientes({ modo: 'memoria' }));

  const criado = controlador.cadastrar(dadosPaciente());
  assert.equal(criado.id, 1);
  assert.equal(criado.cpf, '12345678901');
  assert.equal(criado.telefones[0].numero, '83988776655');

  assert.throws(
    () => controlador.cadastrar(dadosPaciente({ nomeCompleto: 'Outro', email: 'outro@email.com' })),
    (erro) => erro instanceof ErroDePacienteDuplicado,
  );

  const editado = controlador.atualizar(1, { nomeCompleto: 'Carlos E. Santos', ativo: false });
  assert.equal(editado.nomeCompleto, 'Carlos E. Santos');
  assert.equal(editado.ativo, false);
  assert.equal(editado.cpf, '12345678901', 'campos não enviados devem ser preservados');

  controlador.remover(1);
  assert.throws(() => controlador.obterPorId(1), (erro) => erro instanceof ErroDePacienteNaoEncontrado);
  assert.throws(() => controlador.remover(1), (erro) => erro instanceof ErroDePacienteNaoEncontrado);
});

test('ControladorDePacientes impede que a edição use o CPF de outro paciente', () => {
  const controlador = new ControladorDePacientes(criarRepositorioDePacientes({ modo: 'memoria' }));
  controlador.cadastrar(dadosPaciente({ cpf: '11111111111' }));
  controlador.cadastrar(dadosPaciente({ cpf: '22222222222' }));

  assert.throws(
    () => controlador.atualizar(2, { cpf: '11111111111' }),
    (erro) => erro instanceof ErroDePacienteDuplicado,
  );
});

test('ControladorDePacientes pagina a listagem e rejeita parâmetros inválidos', () => {
  const controlador = new ControladorDePacientes(criarRepositorioDePacientes({ modo: 'memoria' }));
  for (let i = 1; i <= 12; i += 1) {
    controlador.cadastrar(dadosPaciente({ nomeCompleto: `Paciente ${i}`, cpf: cpfDoIndice(i) }));
  }

  const segundaPagina = controlador.listarPaginado({ pagina: 2, tamanhoPagina: 5 });
  assert.deepEqual(segundaPagina.dados.map((p) => p.id), [6, 7, 8, 9, 10]);
  assert.deepEqual(segundaPagina.paginacao, { pagina: 2, tamanhoPagina: 5, totalItens: 12, totalPaginas: 3 });

  const padrao = controlador.listarPaginado();
  assert.equal(padrao.dados.length, 10);
  assert.equal(padrao.paginacao.pagina, 1);

  assert.throws(() => controlador.listarPaginado({ pagina: 0 }), { name: 'ErroDeValidacaoDePaciente' });
  assert.throws(() => controlador.listarPaginado({ tamanhoPagina: 101 }), { name: 'ErroDeValidacaoDePaciente' });
  assert.throws(() => controlador.listarPaginado({ pagina: 'abc' }), { name: 'ErroDeValidacaoDePaciente' });
});

test('repositório de pacientes em arquivo binário persiste entre instâncias', () => {
  const diretorio = fs.mkdtempSync(path.join(os.tmpdir(), 'clinicore-pacientes-'));
  const arquivo = path.join(diretorio, 'pacientes.bin');

  try {
    const primeiro = new ControladorDePacientes(criarRepositorioDePacientes({ modo: 'arquivo', arquivo }));
    primeiro.cadastrar(dadosPaciente());
    primeiro.atualizar(1, { nomeCompleto: 'Nome Atualizado' });

    const segundo = new ControladorDePacientes(criarRepositorioDePacientes({ modo: 'arquivo', arquivo }));
    const recuperado = segundo.obterPorId(1);
    assert.equal(recuperado.nomeCompleto, 'Nome Atualizado');
    assert.equal(recuperado.telefones[0].numero, '83988776655');

    segundo.remover(1);
    const terceiro = new ControladorDePacientes(criarRepositorioDePacientes({ modo: 'arquivo', arquivo }));
    assert.equal(terceiro.listarPaginado().paginacao.totalItens, 0);
  } finally {
    fs.rmSync(diretorio, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Rotas HTTP + autenticação + RBAC
// ---------------------------------------------------------------------------

test('rotas de pacientes exigem autenticação (401 sem token ou com token inválido)', async () => {
  const { app } = await montarAmbiente();

  const semToken = await app.simularRequisicao({ method: 'GET', url: '/api/pacientes' });
  assert.equal(semToken.status, 401);

  const tokenInvalido = await app.simularRequisicao({
    method: 'POST',
    url: '/api/pacientes',
    headers: { authorization: 'Bearer token.invalido.aqui' },
    body: dadosPaciente(),
  });
  assert.equal(tokenInvalido.status, 401);
});

test('rotas de pacientes negam acesso (403) a papéis que não sejam administrador ou recepcionista', async () => {
  const { app, controladorDePacientes, comToken } = await montarAmbiente();
  controladorDePacientes.cadastrar(dadosPaciente());

  for (const login of ['medico', 'paciente']) {
    const requisicoes = [
      { method: 'GET', url: '/api/pacientes' },
      { method: 'GET', url: '/api/pacientes/1' },
      { method: 'POST', url: '/api/pacientes', body: dadosPaciente({ cpf: '99999999999' }) },
      { method: 'PUT', url: '/api/pacientes/1', body: { nomeCompleto: 'Invasor' } },
      { method: 'DELETE', url: '/api/pacientes/1' },
    ];
    for (const requisicao of requisicoes) {
      const resposta = await app.simularRequisicao({ ...requisicao, headers: comToken(login) });
      assert.equal(resposta.status, 403, `${login} -> ${requisicao.method} ${requisicao.url}`);
    }
  }

  assert.equal(controladorDePacientes.obterPorId(1).nomeCompleto, 'Carlos Eduardo Santos');
});

test('recepcionista e administrador gerenciam o ciclo completo de um paciente', async () => {
  const { app, comToken } = await montarAmbiente();

  const criado = await app.simularRequisicao({
    method: 'POST',
    url: '/api/pacientes',
    headers: comToken('recepcao'),
    body: dadosPaciente(),
  });
  assert.equal(criado.status, 201);
  assert.equal(criado.body.paciente.id, 1);
  assert.equal(criado.body.paciente.cpf, '12345678901');

  const consultado = await app.simularRequisicao({
    method: 'GET',
    url: '/api/pacientes/1',
    headers: comToken('admin'),
  });
  assert.equal(consultado.status, 200);
  assert.equal(consultado.body.paciente.nomeCompleto, 'Carlos Eduardo Santos');

  const editado = await app.simularRequisicao({
    method: 'PUT',
    url: '/api/pacientes/1',
    headers: comToken('admin'),
    body: { nomeCompleto: 'Carlos E. Santos', id: 999 },
  });
  assert.equal(editado.status, 200);
  assert.equal(editado.body.paciente.nomeCompleto, 'Carlos E. Santos');
  assert.equal(editado.body.paciente.id, 1, 'o id não pode ser alterado pelo corpo');

  const removido = await app.simularRequisicao({
    method: 'DELETE',
    url: '/api/pacientes/1',
    headers: comToken('recepcao'),
  });
  assert.equal(removido.status, 200);

  const aposRemocao = await app.simularRequisicao({
    method: 'GET',
    url: '/api/pacientes/1',
    headers: comToken('recepcao'),
  });
  assert.equal(aposRemocao.status, 404);
});

test('rotas de pacientes retornam 400 para dados inválidos, 409 para CPF duplicado e 404 para id inexistente', async () => {
  const { app, comToken } = await montarAmbiente();
  const headers = comToken('recepcao');

  const invalido = await app.simularRequisicao({
    method: 'POST',
    url: '/api/pacientes',
    headers,
    body: dadosPaciente({ genero: 'M' }),
  });
  assert.equal(invalido.status, 400);
  assert.match(invalido.body.erro, /Gênero inválido/);

  await app.simularRequisicao({ method: 'POST', url: '/api/pacientes', headers, body: dadosPaciente() });
  const duplicado = await app.simularRequisicao({ method: 'POST', url: '/api/pacientes', headers, body: dadosPaciente() });
  assert.equal(duplicado.status, 409);

  for (const method of ['GET', 'PUT', 'DELETE']) {
    const inexistente = await app.simularRequisicao({ method, url: '/api/pacientes/42', headers, body: {} });
    assert.equal(inexistente.status, 404, `${method} inexistente`);
  }

  const idNaoNumerico = await app.simularRequisicao({ method: 'GET', url: '/api/pacientes/abc', headers });
  assert.equal(idNaoNumerico.status, 404);
});

test('GET /api/pacientes lista com paginação via query string', async () => {
  const { app, controladorDePacientes, comToken } = await montarAmbiente();
  for (let i = 1; i <= 7; i += 1) {
    controladorDePacientes.cadastrar(dadosPaciente({ nomeCompleto: `Paciente ${i}`, cpf: cpfDoIndice(i) }));
  }

  const resposta = await app.simularRequisicao({
    method: 'GET',
    url: '/api/pacientes?pagina=2&tamanhoPagina=3',
    headers: comToken('admin'),
  });
  assert.equal(resposta.status, 200);
  assert.deepEqual(resposta.body.dados.map((p) => p.nomeCompleto), ['Paciente 4', 'Paciente 5', 'Paciente 6']);
  assert.deepEqual(resposta.body.paginacao, { pagina: 2, tamanhoPagina: 3, totalItens: 7, totalPaginas: 3 });

  const invalida = await app.simularRequisicao({
    method: 'GET',
    url: '/api/pacientes?pagina=-1',
    headers: comToken('admin'),
  });
  assert.equal(invalida.status, 400);
});

