const test = require('node:test');
const assert = require('node:assert/strict');

const { Papel } = require('../src/domain/papel');
const { Usuario } = require('../src/domain/usuario');
const { ControladorDeUsuarios } = require('../src/application/controlador-de-usuarios');
const { Paciente } = require('../src/domain/paciente');
const { Profissional } = require('../src/domain/profissional');
const { VinculoProfissional } = require('../src/domain/vinculo-profissional');
const { Telefone } = require('../src/domain/telefone');
const { Especialidade } = require('../src/domain/especialidade');
const { ErroDeValidacaoDePaciente } = require('../src/domain/erros-de-paciente');
const { ErroDeValidacaoDeProfissional } = require('../src/domain/erros-de-profissional');
const { MapeadorFhirPaciente } = require('../src/domain/mapeadores/mapeador-fhir-paciente');
const { MapeadorFhirProfissional } = require('../src/domain/mapeadores/mapeador-fhir-profissional');

test('Usuario suporta associações opcionais com Paciente e Profissional sem quebrar compatibilidade', () => {
  const usuarioSimples = new Usuario({
    id: 1,
    nome: 'Admin',
    email: 'admin@clinicore.com',
    login: 'admin',
    papel: Papel.ADMINISTRADOR,
  });
  assert.equal(usuarioSimples.pacienteId, null);
  assert.equal(usuarioSimples.profissionalId, null);

  const usuarioPaciente = new Usuario({
    id: 2,
    nome: 'João Silva',
    email: 'joao@email.com',
    login: 'joaosilva',
    papel: Papel.PACIENTE,
    pacienteId: 10,
  });
  assert.equal(usuarioPaciente.pacienteId, 10);
  assert.equal(usuarioPaciente.profissionalId, null);

  const usuarioMedico = new Usuario({
    id: 3,
    nome: 'Dra. Beatriz',
    email: 'beatriz@clinicore.com',
    login: 'beatriz',
    papel: Papel.MEDICO,
    profissionalId: 20,
  });
  assert.equal(usuarioMedico.profissionalId, 20);
});

test('ControladorDeUsuarios adiciona e recupera vínculos com paciente e profissional', () => {
  const controlador = new ControladorDeUsuarios();
  const usuario = controlador.adicionar({
    nome: 'Dra. Helena Costa',
    email: 'helena@clinicore.com',
    login: 'helena',
    senha: 'SenhaForte@123',
    papel: Papel.MEDICO,
    profissionalId: 42,
  });

  assert.equal(usuario.profissionalId, 42);
  assert.equal(usuario.pacienteId, null);

  const buscado = controlador.obterPorId(usuario.id);
  assert.equal(buscado.profissionalId, 42);
});

test('Paciente valida dados demográficos em conformidade com o padrão FHIR', () => {
  const pacienteValido = new Paciente({
    id: 1,
    cpf: '12345678901',
    cns: '898001002003004',
    nomeCompleto: 'Carlos Eduardo Santos',
    dataNascimento: '1985-04-12',
    genero: 'male',
    telefones: ['83988776655'],
    email: 'carlos@email.com',
    endereco: {
      logradouro: 'Av. Epitácio Pessoa',
      numero: '1000',
      bairro: 'Estados',
      cidade: 'João Pessoa',
      uf: 'PB',
      cep: '58030000',
    },
  });

  assert.equal(pacienteValido.id, 1);
  assert.equal(pacienteValido.cpf, '12345678901');
  assert.equal(pacienteValido.genero, 'male');
  assert.equal(pacienteValido.ativo, true);

  // Validação: nome não pode ser vazio
  assert.throws(
    () => new Paciente({ nomeCompleto: '   ', cpf: '12345678901', dataNascimento: '1990-01-01', genero: 'male' }),
    { name: 'ErroDeValidacaoDePaciente', message: 'Nome completo do paciente é obrigatório.' },
  );

  // Validação: CPF obrigatório e com 11 dígitos
  assert.throws(
    () => new Paciente({ nomeCompleto: 'Carlos', cpf: '123', dataNascimento: '1990-01-01', genero: 'male' }),
    { name: 'ErroDeValidacaoDePaciente', message: 'CPF inválido. Deve conter 11 dígitos numéricos.' },
  );

  // Validação: Gênero deve seguir o ValueSet administrative-gender do FHIR (male, female, other, unknown)
  assert.throws(
    () => new Paciente({ nomeCompleto: 'Carlos', cpf: '12345678901', dataNascimento: '1990-01-01', genero: 'M' }),
    { name: 'ErroDeValidacaoDePaciente', message: 'Gênero inválido segundo o padrão FHIR. Valores permitidos: male, female, other, unknown.' },
  );

  // Validação: Data de nascimento não pode estar no futuro
  assert.throws(
    () => new Paciente({ nomeCompleto: 'Carlos', cpf: '12345678901', dataNascimento: '2099-01-01', genero: 'male' }),
    { name: 'ErroDeValidacaoDePaciente', message: 'Data de nascimento não pode ser futura.' },
  );
});

test('Profissional valida conselho e registro profissional', () => {
  const medico = new Profissional({
    id: 1,
    nomeCompleto: 'Dra. Camila Alencar',
    cpf: '98765432100',
    conselho: 'CRM',
    numeroRegistro: '12345',
    ufRegistro: 'PB',
    especialidades: ['Cardiologia'],
  });

  assert.equal(medico.id, 1);
  assert.equal(medico.conselho, 'CRM');
  assert.equal(medico.numeroRegistro, '12345');
  assert.equal(medico.especialidades[0].nome, 'Cardiologia');

  // Validação: Conselho obrigatório
  assert.throws(
    () => new Profissional({ nomeCompleto: 'Camila', conselho: '', numeroRegistro: '123' }),
    { name: 'ErroDeValidacaoDeProfissional', message: 'Conselho profissional é obrigatório (ex: CRM, COREN).' },
  );

  // Validação: Número de registro obrigatório
  assert.throws(
    () => new Profissional({ nomeCompleto: 'Camila', conselho: 'CRM', numeroRegistro: '   ' }),
    { name: 'ErroDeValidacaoDeProfissional', message: 'Número de registro no conselho é obrigatório.' },
  );
});

test('VinculoProfissional conecta profissional à clínica e define especialidades', () => {
  const vinculo = new VinculoProfissional({
    id: 10,
    profissionalId: 1,
    clinicaId: 1,
    papel: 'MEDICO',
    especialidades: ['Cardiologia', 'Ecocardiografia'],
  });

  assert.equal(vinculo.profissionalId, 1);
  assert.equal(vinculo.clinicaId, 1);
  assert.equal(vinculo.papel, 'MEDICO');
  assert.equal(vinculo.ativo, true);
  assert.equal(vinculo.especialidades.length, 2);
});

test('MapeadorFhirPaciente converte bidirecionalmente entre o modelo de domínio e FHIR R4 Patient', () => {
  const paciente = new Paciente({
    id: 101,
    cpf: '11122233344',
    cns: '700000000000001',
    nomeCompleto: 'Juliana Paes Ferreira',
    dataNascimento: '1992-08-20',
    genero: 'female',
    telefones: ['83991234567'],
    email: 'juliana@exemplo.com',
    endereco: {
      logradouro: 'Rua Bancário Sérgio Guerra',
      numero: '500',
      bairro: 'Bancários',
      cidade: 'João Pessoa',
      uf: 'PB',
      cep: '58051-000',
    },
    ativo: true,
  });

  const fhirResource = MapeadorFhirPaciente.paraFhir(paciente);

  assert.equal(fhirResource.resourceType, 'Patient');
  assert.equal(fhirResource.id, '101');
  assert.equal(fhirResource.active, true);
  assert.equal(fhirResource.gender, 'female');
  assert.equal(fhirResource.birthDate, '1992-08-20');
  assert.equal(fhirResource.name[0].text, 'Juliana Paes Ferreira');
  assert.ok(fhirResource.identifier.some((id) => id.value === '11122233344'));
  assert.ok(fhirResource.telecom.some((t) => t.system === 'phone' && t.value === '83991234567'));
  assert.ok(fhirResource.telecom.some((t) => t.system === 'email' && t.value === 'juliana@exemplo.com'));

  // Deserialização de volta para o Domínio
  const reconstruido = MapeadorFhirPaciente.deFhir(fhirResource);
  assert.equal(reconstruido.id, 101);
  assert.equal(reconstruido.cpf, '11122233344');
  assert.equal(reconstruido.nomeCompleto, 'Juliana Paes Ferreira');
  assert.equal(reconstruido.genero, 'female');
  assert.equal(reconstruido.dataNascimento, '1992-08-20');
});

test('MapeadorFhirProfissional converte bidirecionalmente entre o modelo de domínio e FHIR R4 Practitioner', () => {
  const profissional = new Profissional({
    id: 202,
    nomeCompleto: 'Dr. Roberto Rocha',
    cpf: '55566677788',
    conselho: 'CRM',
    numeroRegistro: '9876',
    ufRegistro: 'PB',
    especialidades: ['Ortopedia'],
    ativo: true,
  });

  const fhirResource = MapeadorFhirProfissional.paraFhir(profissional);

  assert.equal(fhirResource.resourceType, 'Practitioner');
  assert.equal(fhirResource.id, '202');
  assert.equal(fhirResource.active, true);
  assert.equal(fhirResource.name[0].text, 'Dr. Roberto Rocha');
  assert.ok(fhirResource.identifier.some((id) => id.value === '9876' && id.assigner?.display === 'CRM-PB'));
  assert.ok(fhirResource.qualification.some((q) => q.code?.text === 'Ortopedia'));

  // Deserialização
  const reconstruido = MapeadorFhirProfissional.deFhir(fhirResource);
  assert.equal(reconstruido.id, 202);
  assert.equal(reconstruido.nomeCompleto, 'Dr. Roberto Rocha');
  assert.equal(reconstruido.numeroRegistro, '9876');
  assert.equal(reconstruido.conselho, 'CRM');
  assert.equal(reconstruido.ufRegistro, 'PB');
  assert.equal(reconstruido.especialidades[0].nome, 'Ortopedia');
});

test('Telefone encapsula número e tipo de contato com validações', () => {
  const tel = new Telefone({ numero: '(83) 98877-6655', tipo: 'mobile' });
  assert.equal(tel.numero, '83988776655');
  assert.equal(tel.tipo, 'mobile');

  assert.throws(
    () => new Telefone({ numero: '   ' }),
    { message: 'Número de telefone é obrigatório.' },
  );

  assert.throws(
    () => new Telefone({ numero: '83999998888', tipo: 'invalido' }),
    { message: 'Tipo de telefone inválido. Tipos permitidos: mobile, home, work, temp, old.' },
  );
});

test('Especialidade encapsula nome e RQE com validação', () => {
  const esp = new Especialidade({ nome: 'Cardiologia', rqe: '12345' });
  assert.equal(esp.nome, 'Cardiologia');
  assert.equal(esp.rqe, '12345');

  assert.throws(
    () => new Especialidade({ nome: '   ' }),
    { message: 'Nome da especialidade é obrigatório.' },
  );
});

test('Paciente e Profissional utilizam as entidades auxiliares Telefone e Especialidade', () => {
  const paciente = new Paciente({
    nomeCompleto: 'Lucas Medeiros',
    cpf: '12312312344',
    dataNascimento: '1995-10-10',
    genero: 'male',
    telefones: [
      new Telefone({ numero: '83999112233', tipo: 'mobile' }),
      { numero: '8332112233', tipo: 'home' },
    ],
  });

  assert.equal(paciente.telefones.length, 2);
  assert.ok(paciente.telefones[0] instanceof Telefone);
  assert.ok(paciente.telefones[1] instanceof Telefone);
  assert.equal(paciente.telefones[0].numero, '83999112233');
  assert.equal(paciente.telefones[1].tipo, 'home');

  const profissional = new Profissional({
    nomeCompleto: 'Dra. Luiza Martins',
    conselho: 'CRM',
    numeroRegistro: '7788',
    especialidades: [
      new Especialidade({ nome: 'Dermatologia', rqe: '9988' }),
      'Pediatria',
    ],
  });

  assert.equal(profissional.especialidades.length, 2);
  assert.ok(profissional.especialidades[0] instanceof Especialidade);
  assert.ok(profissional.especialidades[1] instanceof Especialidade);
  assert.equal(profissional.especialidades[0].nome, 'Dermatologia');
  assert.equal(profissional.especialidades[1].nome, 'Pediatria');
});


