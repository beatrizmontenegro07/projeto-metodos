const { Papel } = require('../domain/papel');
const { Usuario } = require('../domain/usuario');

class ControladorDeUsuarios {
  #usuarios = [];

  adicionar({ nome, email, papel }) {
    this.#validarPapel(papel);
    this.#garantirEmailDisponivel(email);

    const usuario = new Usuario({
      id: this.#usuarios.length + 1,
      nome,
      email,
      papel,
    });

    this.#usuarios.push(usuario);
    return this.#copiarUsuario(usuario);
  }

  listar() {
    return this.#usuarios.map((usuario) => this.#copiarUsuario(usuario));
  }

  #copiarUsuario({ id, nome, email, papel }) {
    return new Usuario({ id, nome, email, papel });
  }

  #validarPapel(papel) {
    if (!Object.values(Papel).includes(papel)) {
      throw new Error('O papel do usuário é inválido.');
    }
  }

  #garantirEmailDisponivel(email) {
    const emailJaCadastrado = this.#usuarios.some((usuario) => usuario.email === email);

    if (emailJaCadastrado) {
      throw new Error('Já existe um usuário cadastrado com este e-mail.');
    }
  }
}

module.exports = { ControladorDeUsuarios };
