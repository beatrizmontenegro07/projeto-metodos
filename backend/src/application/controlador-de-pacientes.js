const { Paciente } = require('../domain/paciente');
const {
  ErroDeValidacaoDePaciente,
  ErroDePacienteNaoEncontrado,
  ErroDePacienteDuplicado,
} = require('../domain/erros-de-paciente');

const TAMANHO_PAGINA_PADRAO = 10;
const TAMANHO_PAGINA_MAXIMO = 100;

const CAMPOS_EDITAVEIS = Object.freeze([
  'cpf',
  'cns',
  'nomeCompleto',
  'dataNascimento',
  'genero',
  'telefones',
  'email',
  'endereco',
  'ativo',
]);

/**
 * Casos de uso de gerenciamento de pacientes (UC01 / RF01).
 * Depende apenas da porta RepositorioDePacientes, injetada pelo chamador.
 */
class ControladorDePacientes {
  #repositorio;

  constructor(repositorio) {
    if (!repositorio) {
      throw new Error('ControladorDePacientes exige um RepositorioDePacientes.');
    }
    this.#repositorio = repositorio;
  }

  cadastrar(dados = {}) {
    const paciente = new Paciente({ ...this.#filtrarCamposEditaveis(dados), id: this.#proximoId() });
    this.#garantirCpfDisponivel(paciente.cpf);
    this.#repositorio.salvar(this.#paraRegistro(paciente));
    return this.#paraEntidade(this.#paraRegistro(paciente));
  }

  obterPorId(id) {
    return this.#paraEntidade(this.#buscarRegistro(id));
  }

  atualizar(id, dados = {}) {
    const existente = this.#buscarRegistro(id);
    const paciente = new Paciente({
      ...existente,
      ...this.#filtrarCamposEditaveis(dados),
      id: existente.id,
    });
    this.#garantirCpfDisponivel(paciente.cpf, existente.id);
    this.#repositorio.atualizar(this.#paraRegistro(paciente));
    return this.#paraEntidade(this.#paraRegistro(paciente));
  }

  remover(id) {
    const existente = this.#buscarRegistro(id);
    this.#repositorio.remover(existente.id);
  }

  listarPaginado({ pagina = 1, tamanhoPagina = TAMANHO_PAGINA_PADRAO } = {}) {
    const paginaNumerica = this.#validarInteiroPositivo(pagina, 'pagina');
    const tamanhoNumerico = this.#validarInteiroPositivo(tamanhoPagina, 'tamanhoPagina');
    if (tamanhoNumerico > TAMANHO_PAGINA_MAXIMO) {
      throw new ErroDeValidacaoDePaciente(
        `O parâmetro tamanhoPagina deve ser no máximo ${TAMANHO_PAGINA_MAXIMO}.`,
      );
    }

    const registros = this.#repositorio.listar().sort((a, b) => a.id - b.id);
    const inicio = (paginaNumerica - 1) * tamanhoNumerico;

    return {
      dados: registros.slice(inicio, inicio + tamanhoNumerico).map((r) => this.#paraEntidade(r)),
      paginacao: {
        pagina: paginaNumerica,
        tamanhoPagina: tamanhoNumerico,
        totalItens: registros.length,
        totalPaginas: Math.ceil(registros.length / tamanhoNumerico),
      },
    };
  }

  #buscarRegistro(id) {
    const idNumerico = Number(id);
    const registro = Number.isInteger(idNumerico)
      ? this.#repositorio.listar().find((p) => p.id === idNumerico)
      : undefined;
    if (!registro) throw new ErroDePacienteNaoEncontrado(id);
    return registro;
  }

  #garantirCpfDisponivel(cpf, idIgnorado) {
    const conflito = this.#repositorio.listar().some((p) => p.cpf === cpf && p.id !== idIgnorado);
    if (conflito) throw new ErroDePacienteDuplicado();
  }

  #proximoId() {
    return this.#repositorio.listar().reduce((maior, p) => Math.max(maior, p.id), 0) + 1;
  }

  #validarInteiroPositivo(valor, nome) {
    const numero = Number(valor);
    if (!Number.isInteger(numero) || numero < 1) {
      throw new ErroDeValidacaoDePaciente(`O parâmetro ${nome} deve ser um inteiro maior ou igual a 1.`);
    }
    return numero;
  }

  #filtrarCamposEditaveis(dados) {
    return Object.fromEntries(
      Object.entries(dados || {}).filter(([campo]) => CAMPOS_EDITAVEIS.includes(campo)),
    );
  }

  #paraRegistro(paciente) {
    return structuredClone({ ...paciente, telefones: paciente.telefones.map((t) => ({ ...t })) });
  }

  #paraEntidade(registro) {
    return new Paciente(registro);
  }
}

module.exports = { ControladorDePacientes, TAMANHO_PAGINA_PADRAO, TAMANHO_PAGINA_MAXIMO };

