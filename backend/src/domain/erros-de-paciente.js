class ErroDeValidacaoDePaciente extends Error {
  constructor(message) {
    super(message);
    this.name = 'ErroDeValidacaoDePaciente';
  }
}

class ErroDePacienteNaoEncontrado extends Error {
  constructor(id) {
    super(`Paciente com id ${id} não encontrado.`);
    this.name = 'ErroDePacienteNaoEncontrado';
  }
}

class ErroDePacienteDuplicado extends Error {
  constructor(message = 'Já existe um paciente cadastrado com este CPF.') {
    super(message);
    this.name = 'ErroDePacienteDuplicado';
  }
}

class ErroDePersistenciaDePacientes extends Error {
  constructor(message) {
    super(message);
    this.name = 'ErroDePersistenciaDePacientes';
  }
}

module.exports = {
  ErroDeValidacaoDePaciente,
  ErroDePacienteNaoEncontrado,
  ErroDePacienteDuplicado,
  ErroDePersistenciaDePacientes,
};
