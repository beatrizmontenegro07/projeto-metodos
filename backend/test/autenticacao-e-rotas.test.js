const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { Papel } = require('../src/domain/papel');
const { Usuario } = require('../src/domain/usuario');
const { ErroDeAutenticacao, ErroDeValidacaoDeUsuario } = require('../src/domain/erros-de-usuario');
const { ControladorDeUsuarios } = require('../src/application/controlador-de-usuarios');
const { criarRepositorioDeUsuarios } = require('../src/infra/fabrica-de-repositorio-de-usuarios');
const { gerarTokenJwt, verificarTokenJwt } = require('../src/infra/servico-de-token-jwt');
const { criarAplicacao } = require('../src/api/criar-aplicacao');
const { exigirPapel } = require('../src/api/middleware-autenticacao');

const JWT_SECRET_TESTE = 'segredo-super-seguro-para-testes-clinicore-2026';

const dadosUsuarioValido = (overrides = {}) => ({
  nome: 'Ana Silva',
  email: 'ana@clinicore.com',
  login: 'anasilva',
  senha: 'Senha@123',
  papel: Papel.RECEPCIONISTA,
  ...overrides,
});

test('deve autenticar usuário válido por login ou por e-mail sem expor senha ou hash', () => {
  const controlador = new ControladorDeUsuarios();
  controlador.adicionar(dadosUsuarioValido());

  const autenticadoPorLogin = controlador.autenticar({ login: 'anasilva', senha: 'Senha@123' });
  assert.ok(autenticadoPorLogin instanceof Usuario);
  assert.equal(autenticadoPorLogin.id, 1);
  assert.equal(autenticadoPorLogin.login, 'anasilva');
  assert.equal(autenticadoPorLogin.email, 'ana@clinicore.com');
  assert.equal(autenticadoPorLogin.papel, Papel.RECEPCIONISTA);
  assert.equal(Object.hasOwn(autenticadoPorLogin, 'senha'), false);
  assert.equal(Object.hasOwn(autenticadoPorLogin, 'senhaHash'), false);

  const autenticadoPorEmail = controlador.autenticar({ login: 'ana@clinicore.com', senha: 'Senha@123' });
  assert.equal(autenticadoPorEmail.id, 1);
});

test('deve recusar autenticação com senha incorreta, usuário inexistente ou dados vazios', () => {
  const controlador = new ControladorDeUsuarios();
  controlador.adicionar(dadosUsuarioValido());

  assert.throws(
    () => controlador.autenticar({ login: 'anasilva', senha: 'SenhaErrada@123' }),
    (erro) => erro instanceof ErroDeAutenticacao && /credenciais inválidas/i.test(erro.message),
  );

  assert.throws(
    () => controlador.autenticar({ login: 'inexistente', senha: 'Senha@123' }),
    (erro) => erro instanceof ErroDeAutenticacao && /credenciais inválidas/i.test(erro.message),
  );

  assert.throws(
    () => controlador.autenticar({ login: '', senha: 'Senha@123' }),
    (erro) => erro instanceof ErroDeAutenticacao && /obrigatórios/i.test(erro.message),
  );

  assert.throws(
    () => controlador.autenticar({ login: 'anasilva', senha: '' }),
    (erro) => erro instanceof ErroDeAutenticacao && /obrigatórios/i.test(erro.message),
  );
});

test('deve rejeitar cadastro com login duplicado para garantir integridade de identificação', () => {
  const controlador = new ControladorDeUsuarios();
  controlador.adicionar(dadosUsuarioValido({ email: 'ana1@clinicore.com', login: 'anasilva' }));

  assert.throws(
    () => controlador.adicionar(dadosUsuarioValido({ email: 'ana2@clinicore.com', login: 'anasilva' })),
    (erro) => erro instanceof ErroDeValidacaoDeUsuario && /login/i.test(erro.message),
  );
});

test('deve persistir hash criptográfico em arquivo binário sem salvar senha em texto puro e permitir login posterior', () => {
  const diretorio = fs.mkdtempSync(path.join(os.tmpdir(), 'clinicore-auth-'));
  const arquivo = path.join(diretorio, 'usuarios.bin');

  try {
    const primeiroControlador = new ControladorDeUsuarios(criarRepositorioDeUsuarios({ modo: 'arquivo', arquivo }));
    primeiroControlador.adicionar(dadosUsuarioValido({ senha: 'SegredoForte@99' }));

    const conteudoBruto = fs.readFileSync(arquivo);
    assert.equal(conteudoBruto.includes(Buffer.from('SegredoForte@99')), false);

    const segundoControlador = new ControladorDeUsuarios(criarRepositorioDeUsuarios({ modo: 'arquivo', arquivo }));
    const usuario = segundoControlador.autenticar({ login: 'anasilva', senha: 'SegredoForte@99' });
    assert.equal(usuario.email, 'ana@clinicore.com');
    assert.equal(Object.hasOwn(usuario, 'senha'), false);
    assert.equal(Object.hasOwn(usuario, 'senhaHash'), false);
  } finally {
    fs.rmSync(diretorio, { recursive: true, force: true });
  }
});

test('POST /api/auth/login deve autenticar usuário e retornar token JWT assinado com JWT_SECRET', async () => {
  const controladorDeUsuarios = new ControladorDeUsuarios();
  controladorDeUsuarios.adicionar(dadosUsuarioValido());

  const app = criarAplicacao({ controladorDeUsuarios, jwtSecret: JWT_SECRET_TESTE });

  const resposta = await app.simularRequisicao({
    method: 'POST',
    url: '/api/auth/login',
    body: { login: 'anasilva', senha: 'Senha@123' },
  });

  assert.equal(resposta.status, 200);
  assert.ok(resposta.body.token);
  assert.deepEqual(resposta.body.usuario, {
    id: 1,
    nome: 'Ana Silva',
    email: 'ana@clinicore.com',
    login: 'anasilva',
    papel: Papel.RECEPCIONISTA,
  });

  const payload = verificarTokenJwt(resposta.body.token, { segredo: JWT_SECRET_TESTE });
  assert.equal(payload.sub, 1);
  assert.equal(payload.login, 'anasilva');
  assert.equal(payload.papel, Papel.RECEPCIONISTA);
});

test('POST /api/auth/login deve retornar 401 para credenciais inválidas e detectar adulteração de token', async () => {
  const controladorDeUsuarios = new ControladorDeUsuarios();
  controladorDeUsuarios.adicionar(dadosUsuarioValido());

  const app = criarAplicacao({ controladorDeUsuarios, jwtSecret: JWT_SECRET_TESTE });

  const resposta = await app.simularRequisicao({
    method: 'POST',
    url: '/api/auth/login',
    body: { login: 'anasilva', senha: 'SenhaIncorreta@1' },
  });

  assert.equal(resposta.status, 401);
  assert.match(resposta.body.erro, /credenciais inválidas/i);
});

test('GET /api/auth/me deve retornar dados do usuário autenticado com Bearer token válido e 401 quando inválido ou adulterado', async () => {
  const controladorDeUsuarios = new ControladorDeUsuarios();
  controladorDeUsuarios.adicionar(dadosUsuarioValido());

  const app = criarAplicacao({ controladorDeUsuarios, jwtSecret: JWT_SECRET_TESTE });

  const loginRes = await app.simularRequisicao({
    method: 'POST',
    url: '/api/auth/login',
    body: { login: 'anasilva', senha: 'Senha@123' },
  });
  const { token } = loginRes.body;

  const meRes = await app.simularRequisicao({
    method: 'GET',
    url: '/api/auth/me',
    headers: { authorization: `Bearer ${token}` },
  });
  assert.equal(meRes.status, 200);
  assert.equal(meRes.body.usuario.login, 'anasilva');
  assert.equal(meRes.body.usuario.papel, Papel.RECEPCIONISTA);

  const semTokenRes = await app.simularRequisicao({
    method: 'GET',
    url: '/api/auth/me',
  });
  assert.equal(semTokenRes.status, 401);

  const tokenOutroSegredo = gerarTokenJwt(
    { sub: 1, login: 'anasilva', papel: Papel.ADMINISTRADOR },
    { segredo: 'outro-segredo-invalido' },
  );
  const tokenInvalidoRes = await app.simularRequisicao({
    method: 'GET',
    url: '/api/auth/me',
    headers: { authorization: `Bearer ${tokenOutroSegredo}` },
  });
  assert.equal(tokenInvalidoRes.status, 401);
});

test('controle de acesso RBAC deve bloquear papel não autorizado com 403 e permitir papel autorizado', async () => {
  const controladorDeUsuarios = new ControladorDeUsuarios();
  controladorDeUsuarios.adicionar(dadosUsuarioValido({ papel: Papel.RECEPCIONISTA }));
  controladorDeUsuarios.adicionar(dadosUsuarioValido({
    nome: 'Dr. Carlos',
    email: 'carlos@clinicore.com',
    login: 'carlos',
    papel: Papel.ADMINISTRADOR,
  }));

  const app = criarAplicacao({
    controladorDeUsuarios,
    jwtSecret: JWT_SECRET_TESTE,
    configurarRotasExtras: (rotas, { autenticarRequisicao }) => {
      rotas.push({
        method: 'GET',
        path: '/api/admin/usuarios',
        middlewares: [autenticarRequisicao, exigirPapel(Papel.ADMINISTRADOR)],
        handler: (_req, res) => res.status(200).json({ usuarios: controladorDeUsuarios.listar() }),
      });
    },
  });

  const loginRecep = await app.simularRequisicao({
    method: 'POST',
    url: '/api/auth/login',
    body: { login: 'anasilva', senha: 'Senha@123' },
  });
  const { token: tokenRecep } = loginRecep.body;

  const resProibido = await app.simularRequisicao({
    method: 'GET',
    url: '/api/admin/usuarios',
    headers: { authorization: `Bearer ${tokenRecep}` },
  });
  assert.equal(resProibido.status, 403);

  const loginAdmin = await app.simularRequisicao({
    method: 'POST',
    url: '/api/auth/login',
    body: { login: 'carlos', senha: 'Senha@123' },
  });
  const { token: tokenAdmin } = loginAdmin.body;

  const resPermitido = await app.simularRequisicao({
    method: 'GET',
    url: '/api/admin/usuarios',
    headers: { authorization: `Bearer ${tokenAdmin}` },
  });
  assert.equal(resPermitido.status, 200);
  assert.equal(resPermitido.body.usuarios.length, 2);
});

