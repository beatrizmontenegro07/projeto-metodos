class Usuario {
  constructor({ id, nome, email, login, papel, pacienteId = null, profissionalId = null }) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.login = login;
    this.papel = papel;
    this.pacienteId = pacienteId;
    this.profissionalId = profissionalId;
  }
}

module.exports = { Usuario };
