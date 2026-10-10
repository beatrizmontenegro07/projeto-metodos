class Usuario {
  constructor({ id, nome, email, papel }) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.papel = papel;
  }
}

module.exports = { Usuario };
