const fs = require('node:fs');
const v8 = require('node:v8');
const { ErroDePersistenciaDeUsuarios } = require('../domain/erros-de-usuario');

class RepositorioEmMemoria {
  tipo = 'memoria';
  #usuarios = [];
  listar() { return this.#usuarios.map((usuario) => ({ ...usuario })); }
  salvar(usuario) { this.#usuarios.push({ ...usuario }); }
}

class RepositorioEmArquivoBinario {
  tipo = 'arquivo';
  #arquivo;
  constructor(arquivo) { this.#arquivo = arquivo; }
  listar() {
    try {
      if (!fs.existsSync(this.#arquivo)) return [];
      const usuarios = v8.deserialize(fs.readFileSync(this.#arquivo));
      if (!Array.isArray(usuarios)) throw new Error('formato inválido');
      return usuarios.map((usuario) => ({ ...usuario }));
    } catch (erro) {
      throw new ErroDePersistenciaDeUsuarios(`Não foi possível ler usuários: ${erro.message}`);
    }
  }
  salvar(usuario) {
    try {
      const usuarios = this.listar();
      usuarios.push({ ...usuario });
      fs.writeFileSync(this.#arquivo, v8.serialize(usuarios));
    } catch (erro) {
      if (erro instanceof ErroDePersistenciaDeUsuarios) throw erro;
      throw new ErroDePersistenciaDeUsuarios(`Não foi possível gravar usuários: ${erro.message}`);
    }
  }
}

function criarRepositorioDeUsuarios({ modo = 'memoria', arquivo = 'usuarios.bin' } = {}) {
  if (modo === 'memoria') return new RepositorioEmMemoria();
  if (modo === 'arquivo') return new RepositorioEmArquivoBinario(arquivo);
  throw new ErroDePersistenciaDeUsuarios('Modo de persistência deve ser memoria ou arquivo.');
}

module.exports = { criarRepositorioDeUsuarios };
