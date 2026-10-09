const { Papel } = require('../domain/papel');
const { Usuario } = require('../domain/usuario');
const { ErroDeValidacaoDeUsuario } = require('../domain/erros-de-usuario');
const { criarRepositorioDeUsuarios } = require('../infra/fabrica-de-repositorio-de-usuarios');

class ControladorDeUsuarios {
  #repositorio;
  constructor(repositorio = criarRepositorioDeUsuarios()) { this.#repositorio = repositorio; }

  adicionar({ nome, email, login, senha, papel }) {
    this.#validarPapel(papel);
    this.#validarLogin(login);
    this.#validarSenha(senha, login);
    this.#garantirEmailDisponivel(email);
    const usuario = new Usuario({ id: this.#proximoId(), nome, email, login, papel });
    this.#repositorio.salvar(usuario);
    return this.#copiarUsuario(usuario);
  }

  listar() { return this.#repositorio.listar().map((usuario) => this.#copiarUsuario(usuario)); }
  #proximoId() { return this.listar().reduce((maior, usuario) => Math.max(maior, usuario.id), 0) + 1; }
  #copiarUsuario({ id, nome, email, login, papel }) { return new Usuario({ id, nome, email, login, papel }); }
  #validarPapel(papel) { if (!Object.values(Papel).includes(papel)) throw new ErroDeValidacaoDeUsuario('O papel do usuário é inválido.'); }
  #validarLogin(login) {
    if (typeof login !== 'string' || login.length === 0 || login.length > 12 || /\d/.test(login))
      throw new ErroDeValidacaoDeUsuario('O login não pode ser vazio, ter números ou mais de 12 caracteres.');
  }
  #validarSenha(senha, login) {
    if (typeof senha !== 'string' || senha.length < 8 || senha.length > 128 || senha === login)
      throw new ErroDeValidacaoDeUsuario('A senha não atende à política do IAM.');
    const tipos = [/\p{Ll}/u, /\p{Lu}/u, /\d/u, /[^\p{L}\d]/u].filter((regra) => regra.test(senha));
    if (tipos.length < 3) throw new ErroDeValidacaoDeUsuario('A senha deve conter pelo menos três tipos de caracteres.');
  }
  #garantirEmailDisponivel(email) {
    if (this.listar().some((usuario) => usuario.email === email)) throw new ErroDeValidacaoDeUsuario('Já existe um usuário cadastrado com este e-mail.');
  }
}

module.exports = { ControladorDeUsuarios };
