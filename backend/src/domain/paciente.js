const { ErroDeValidacaoDePaciente } = require('./erros-de-paciente');
const { Telefone } = require('./telefone');

const GENEROS_FHIR_PERMITIDOS = Object.freeze(['male', 'female', 'other', 'unknown']);

class Paciente {
  constructor({
    id,
    cpf,
    cns,
    nomeCompleto,
    dataNascimento,
    genero,
    telefones = [],
    email,
    endereco,
    ativo = true,
  }) {
    this.#validarNome(nomeCompleto);
    this.#validarCpf(cpf);
    this.#validarGenero(genero);
    this.#validarDataNascimento(dataNascimento);

    this.id = id;
    this.cpf = String(cpf).replace(/\D/g, '');
    this.cns = cns ? String(cns).trim() : undefined;
    this.nomeCompleto = nomeCompleto.trim();
    this.dataNascimento = dataNascimento;
    this.genero = genero;
    this.telefones = Array.isArray(telefones)
      ? telefones.map((tel) => Paciente.#criarTelefone(tel))
      : [];
    this.email = email;
    this.endereco = endereco;
    this.ativo = Boolean(ativo);
  }

  static #criarTelefone(tel) {
    if (tel instanceof Telefone) return tel;
    try {
      return typeof tel === 'string' ? new Telefone({ numero: tel }) : new Telefone(tel ?? {});
    } catch (erro) {
      throw new ErroDeValidacaoDePaciente(erro.message);
    }
  }

  #validarNome(nome) {
    if (typeof nome !== 'string' || nome.trim().length === 0) {
      throw new ErroDeValidacaoDePaciente('Nome completo do paciente é obrigatório.');
    }
  }

  #validarCpf(cpf) {
    if (!cpf) {
      throw new ErroDeValidacaoDePaciente('CPF inválido. Deve conter 11 dígitos numéricos.');
    }
    const limpo = String(cpf).replace(/\D/g, '');
    if (limpo.length !== 11) {
      throw new ErroDeValidacaoDePaciente('CPF inválido. Deve conter 11 dígitos numéricos.');
    }
  }

  #validarGenero(genero) {
    if (!GENEROS_FHIR_PERMITIDOS.includes(genero)) {
      throw new ErroDeValidacaoDePaciente(
        'Gênero inválido segundo o padrão FHIR. Valores permitidos: male, female, other, unknown.',
      );
    }
  }

  #validarDataNascimento(dataNascimento) {
    if (!dataNascimento) {
      return;
    }
    const data = new Date(dataNascimento);
    if (Number.isNaN(data.getTime())) {
      throw new ErroDeValidacaoDePaciente('Data de nascimento inválida.');
    }
    const hoje = new Date();
    if (data > hoje) {
      throw new ErroDeValidacaoDePaciente('Data de nascimento não pode ser futura.');
    }
  }
}

module.exports = { Paciente, GENEROS_FHIR_PERMITIDOS };

