const fs = require('node:fs');
const v8 = require('node:v8');
const { ErroDePersistenciaDePacientes } = require('../domain/erros-de-paciente');

/**
 * Implementações da porta RepositorioDePacientes:
 *   listar(): registro[]
 *   salvar(registro): void
 *   atualizar(registro): void
 *   remover(id): void
 * Os registros são objetos simples (sem protótipo); a reconstrução das
 * entidades de domínio fica a cargo da camada de aplicação.
 */
const copiar = (registro) => structuredClone(registro);

class RepositorioDePacientesEmMemoria {
  tipo = 'memoria';
  #pacientes = [];

  listar() { return this.#pacientes.map(copiar); }

  salvar(registro) { this.#pacientes.push(copiar(registro)); }

  atualizar(registro) {
    const indice = this.#pacientes.findIndex((p) => p.id === registro.id);
    if (indice >= 0) this.#pacientes[indice] = copiar(registro);
  }

  remover(id) { this.#pacientes = this.#pacientes.filter((p) => p.id !== id); }
}

class RepositorioDePacientesEmArquivoBinario {
  tipo = 'arquivo';
  #arquivo;

  constructor(arquivo) { this.#arquivo = arquivo; }

  listar() {
    try {
      if (!fs.existsSync(this.#arquivo)) return [];
      const pacientes = v8.deserialize(fs.readFileSync(this.#arquivo));
      if (!Array.isArray(pacientes)) throw new Error('formato inválido');
      return pacientes.map(copiar);
    } catch (erro) {
      throw new ErroDePersistenciaDePacientes(`Não foi possível ler pacientes: ${erro.message}`);
    }
  }

  salvar(registro) {
    this.#gravar([...this.listar(), copiar(registro)]);
  }

  atualizar(registro) {
    this.#gravar(this.listar().map((p) => (p.id === registro.id ? copiar(registro) : p)));
  }

  remover(id) {
    this.#gravar(this.listar().filter((p) => p.id !== id));
  }

  #gravar(pacientes) {
    try {
      fs.writeFileSync(this.#arquivo, v8.serialize(pacientes));
    } catch (erro) {
      throw new ErroDePersistenciaDePacientes(`Não foi possível gravar pacientes: ${erro.message}`);
    }
  }
}

function criarRepositorioDePacientes({ modo = 'memoria', arquivo = 'pacientes.bin' } = {}) {
  if (modo === 'memoria') return new RepositorioDePacientesEmMemoria();
  if (modo === 'arquivo') return new RepositorioDePacientesEmArquivoBinario(arquivo);
  throw new ErroDePersistenciaDePacientes('Modo de persistência deve ser memoria ou arquivo.');
}

module.exports = { criarRepositorioDePacientes };

