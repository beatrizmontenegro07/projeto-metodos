const test = require('node:test');
const assert = require('node:assert/strict');

const { Papel } = require('../src/domain/papel');
const { Usuario } = require('../src/domain/usuario');
const { ControladorDeUsuarios } = require('../src/application/controlador-de-usuarios');

test('adiciona um usuário com papel definido e identificador único', () => {
  const controlador = new ControladorDeUsuarios();

  const usuario = controlador.adicionar({
    nome: 'Ana Silva',
    email: 'ana@clinicore.com',
    login: 'ana',
    senha: 'Senha@123',
    papel: Papel.RECEPCIONISTA,
  });

  assert.equal(usuario.id, 1);
  assert.equal(usuario.nome, 'Ana Silva');
  assert.equal(usuario.email, 'ana@clinicore.com');
  assert.equal(usuario.papel, Papel.RECEPCIONISTA);
  assert.ok(usuario instanceof Usuario);
});

test('rejeita e-mail duplicado sem cadastrar um segundo usuário', () => {
  const controlador = new ControladorDeUsuarios();
  controlador.adicionar({
    nome: 'Ana Silva',
    email: 'ana@clinicore.com',
    login: 'ana',
    senha: 'Senha@123',
    papel: Papel.RECEPCIONISTA,
  });

  assert.throws(
    () => controlador.adicionar({
      nome: 'Outra Ana',
      email: 'ana@clinicore.com',
    login: 'ana',
    senha: 'Senha@123',
      papel: Papel.MEDICO,
    }),
    { message: 'Já existe um usuário cadastrado com este e-mail.' },
  );
  assert.equal(controlador.listar().length, 1);
});

test('rejeita usuário com papel que não faz parte dos papéis permitidos', () => {
  const controlador = new ControladorDeUsuarios();

  assert.throws(
    () => controlador.adicionar({
      nome: 'Ana Silva',
      email: 'ana@clinicore.com',
    login: 'ana',
    senha: 'Senha@123',
      papel: 'GERENTE',
    }),
    { message: 'O papel do usuário é inválido.' },
  );
});

test('lista todos os usuários em ordem de cadastro sem expor a coleção interna', () => {
  const controlador = new ControladorDeUsuarios();
  controlador.adicionar({
    nome: 'Ana Silva',
    email: 'ana@clinicore.com',
    login: 'ana',
    senha: 'Senha@123',
    papel: Papel.RECEPCIONISTA,
  });
  controlador.adicionar({
    nome: 'Dr. Bruno Lima',
    email: 'bruno@clinicore.com',
    login: 'bruno',
    senha: 'Senha@123',
    papel: Papel.MEDICO,
  });

  const usuarios = controlador.listar();
  usuarios.pop();

  assert.deepEqual(
    controlador.listar().map(({ id, nome, papel }) => ({ id, nome, papel })),
    [
      { id: 1, nome: 'Ana Silva', papel: Papel.RECEPCIONISTA },
      { id: 2, nome: 'Dr. Bruno Lima', papel: Papel.MEDICO },
    ],
  );
});

test('não permite alterar um usuário por meio do valor retornado ao adicioná-lo', () => {
  const controlador = new ControladorDeUsuarios();
  const usuario = controlador.adicionar({
    nome: 'Ana Silva',
    email: 'ana@clinicore.com',
    login: 'ana',
    senha: 'Senha@123',
    papel: Papel.RECEPCIONISTA,
  });

  usuario.email = 'outro@clinicore.com';
  usuario.papel = Papel.ADMINISTRADOR;

  const [usuarioArmazenado] = controlador.listar();
  assert.equal(usuarioArmazenado.email, 'ana@clinicore.com');
  assert.equal(usuarioArmazenado.papel, Papel.RECEPCIONISTA);
  assert.throws(
    () => controlador.adicionar({
      nome: 'Outra Ana',
      email: 'ana@clinicore.com',
    login: 'ana',
    senha: 'Senha@123',
      papel: Papel.MEDICO,
    }),
    { message: 'Já existe um usuário cadastrado com este e-mail.' },
  );
});

test('não permite alterar um usuário por meio de uma listagem', () => {
  const controlador = new ControladorDeUsuarios();
  controlador.adicionar({
    nome: 'Ana Silva',
    email: 'ana@clinicore.com',
    login: 'ana',
    senha: 'Senha@123',
    papel: Papel.RECEPCIONISTA,
  });

  const [usuario] = controlador.listar();
  usuario.papel = Papel.ADMINISTRADOR;

  assert.equal(controlador.listar()[0].papel, Papel.RECEPCIONISTA);
});
