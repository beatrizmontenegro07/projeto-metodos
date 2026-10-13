const crypto = require('node:crypto');
const { Papel } = require('../domain/papel');
const { Usuario } = require('../domain/usuario');
const { ErroDeValidacaoDeUsuario, ErroDeAutenticacao } = require('../domain/erros-de-usuario');
const { criarRepositorioDeUsuarios } = require('../infra/fabrica-de-repositorio-de-usuarios');

class ControladorDeUsuarios {
  #repositorio;

  constructor(repositorio = criarRepositorioDeUsuarios()) {
    this.#repositorio = repositorio;
  }

  adicionar({ nome, email, login, senha, papel }) {
    this.#validarPapel(papel);
    this.#validarLogin(login);
    this.#validarSenha(senha, login, email);
    this.#garantirEmailDisponivel(email);
    this.#garantirLoginDisponivel(login);

    const usuario = new Usuario({ id: this.#proximoId(), nome, email, login, papel });
    const senhaHash = this.#gerarHashDeSenha(senha);
    this.#repositorio.salvar({ ...usuario, senhaHash });

    return this.#copiarUsuario(usuario);
  }

  autenticar({ login, senha } = {}) {
    if (typeof login !== 'string' || login.trim().length === 0 || typeof senha !== 'string' || senha.length === 0) {
      throw new ErroDeAutenticacao('Login e senha são obrigatórios.');
    }

    const identificador = login.trim();
    const registros = this.#repositorio.listar();
    const registro = registros.find((u) => u.login === identificador || u.email === identificador);

    if (!registro || !this.#verificarSenha(senha, registro.senhaHash)) {
      throw new ErroDeAutenticacao('Credenciais inválidas.');
    }

    return this.#copiarUsuario(registro);
  }

  obterPorId(id) {
    const registro = this.#repositorio.listar().find((u) => u.id === Number(id));
    return registro ? this.#copiarUsuario(registro) : undefined;
  }

  listar() {
    return this.#repositorio.listar().map((usuario) => this.#copiarUsuario(usuario));
  }

  #proximoId() {
    return this.listar().reduce((maior, usuario) => Math.max(maior, usuario.id), 0) + 1;
  }

  #copiarUsuario({ id, nome, email, login, papel }) {
    return new Usuario({ id, nome, email, login, papel });
  }

  #gerarHashDeSenha(senha) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(senha, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  #verificarSenha(senhaInformada, senhaHashArmazenada) {
    if (typeof senhaHashArmazenada !== 'string' || !senhaHashArmazenada.includes(':')) {
      return false;
    }
    const [salt, hashHexEsperado] = senhaHashArmazenada.split(':');
    const bufferEsperado = Buffer.from(hashHexEsperado, 'hex');
    const bufferCalculado = crypto.scryptSync(senhaInformada, salt, 64);

    if (bufferEsperado.length !== bufferCalculado.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufferEsperado, bufferCalculado);
  }

  #validarPapel(papel) {
    if (!Object.values(Papel).includes(papel)) {
      throw new ErroDeValidacaoDeUsuario('O papel do usuário é inválido.');
    }
  }

  #validarLogin(login) {
    if (typeof login !== 'string' || login.length === 0 || login.length > 12 || /\d/.test(login)) {
      throw new ErroDeValidacaoDeUsuario('O login não pode ser vazio, ter números ou mais de 12 caracteres.');
    }
  }

  #validarSenha(senha, login, email) {
    if (typeof senha !== 'string' || senha.length < 8 || senha.length > 128 || senha === login || senha === email) {
      throw new ErroDeValidacaoDeUsuario('A senha não atende à política do IAM.');
    }
    const tipos = [/\p{Ll}/u, /\p{Lu}/u, /\d/u, /[^\p{L}\d]/u].filter((regra) => regra.test(senha));
    if (tipos.length < 3) {
      throw new ErroDeValidacaoDeUsuario('A senha deve conter pelo menos três tipos de caracteres.');
    }
  }

  #garantirEmailDisponivel(email) {
    if (this.listar().some((usuario) => usuario.email === email)) {
      throw new ErroDeValidacaoDeUsuario('Já existe um usuário cadastrado com este e-mail.');
    }
  }

  #garantirLoginDisponivel(login) {
    if (this.listar().some((usuario) => usuario.login === login)) {
      throw new ErroDeValidacaoDeUsuario('Já existe um usuário cadastrado com este login.');
    }
  }
}

module.exports = { ControladorDeUsuarios };
