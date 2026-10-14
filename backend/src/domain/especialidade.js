class Especialidade {
  constructor({ nome, rqe = null }) {
    this.#validarNome(nome);

    this.nome = nome.trim();
    this.rqe = rqe ? String(rqe).trim() : null;
  }

  #validarNome(nome) {
    if (typeof nome !== 'string' || nome.trim().length === 0) {
      throw new Error('Nome da especialidade é obrigatório.');
    }
  }
}

module.exports = { Especialidade };

