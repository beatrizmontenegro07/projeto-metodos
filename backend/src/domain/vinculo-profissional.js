const { Especialidade } = require('./especialidade');

class VinculoProfissional {
  constructor({
    id,
    profissionalId,
    clinicaId,
    papel,
    especialidades = [],
    ativo = true,
  }) {
    this.id = id;
    this.profissionalId = profissionalId;
    this.clinicaId = clinicaId;
    this.papel = papel;
    this.especialidades = Array.isArray(especialidades)
      ? especialidades.map((esp) => {
          if (esp instanceof Especialidade) return esp;
          if (typeof esp === 'string') return new Especialidade({ nome: esp });
          return new Especialidade(esp);
        })
      : [];
    this.ativo = Boolean(ativo);
  }
}

module.exports = { VinculoProfissional };

