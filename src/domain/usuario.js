class Usuario {
  constructor({ id, nome, email, login, papel }) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.login = login;
    this.papel = papel;
  }
}

module.exports = { Usuario };
