const { ErroDeValidacaoDeProfissional } = require('./erros-de-profissional');
const { Especialidade } = require('./especialidade');

class Profissional {
  constructor({
    id,
    nomeCompleto,
    cpf,
    conselho,
    numeroRegistro,
    ufRegistro,
    especialidades = [],
    ativo = true,
  }) {
    this.#validarNome(nomeCompleto);
    this.#validarConselho(conselho);
    this.#validarNumeroRegistro(numeroRegistro);

    this.id = id;
    this.nomeCompleto = nomeCompleto.trim();
    this.cpf = cpf ? String(cpf).replace(/\D/g, '') : undefined;
    this.conselho = conselho.trim().toUpperCase();
    this.numeroRegistro = String(numeroRegistro).trim();
    this.ufRegistro = ufRegistro ? String(ufRegistro).trim().toUpperCase() : undefined;
    this.especialidades = Array.isArray(especialidades)
      ? especialidades.map((esp) => {
          if (esp instanceof Especialidade) return esp;
          if (typeof esp === 'string') return new Especialidade({ nome: esp });
          return new Especialidade(esp);
        })
      : [];
    this.ativo = Boolean(ativo);
  }

  #validarNome(nome) {
    if (typeof nome !== 'string' || nome.trim().length === 0) {
      throw new ErroDeValidacaoDeProfissional('Nome completo do profissional é obrigatório.');
    }
  }

  #validarConselho(conselho) {
    if (typeof conselho !== 'string' || conselho.trim().length === 0) {
      throw new ErroDeValidacaoDeProfissional('Conselho profissional é obrigatório (ex: CRM, COREN).');
    }
  }

  #validarNumeroRegistro(numeroRegistro) {
    if (
      numeroRegistro === undefined ||
      numeroRegistro === null ||
      String(numeroRegistro).trim().length === 0
    ) {
      throw new ErroDeValidacaoDeProfissional('Número de registro no conselho é obrigatório.');
    }
  }
}

module.exports = { Profissional };

