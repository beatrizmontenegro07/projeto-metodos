const TIPOS_TELEFONE_PERMITIDOS = Object.freeze(['mobile', 'home', 'work', 'temp', 'old']);

class Telefone {
  constructor({ numero, tipo = 'mobile' }) {
    this.#validarNumero(numero);
    this.#validarTipo(tipo);

    this.numero = String(numero).replace(/\D/g, '');
    this.tipo = tipo;
  }

  #validarNumero(numero) {
    if (numero === undefined || numero === null || String(numero).trim().length === 0) {
      throw new Error('Número de telefone é obrigatório.');
    }
    const limpo = String(numero).replace(/\D/g, '');
    if (limpo.length === 0) {
      throw new Error('Número de telefone deve conter dígitos numéricos.');
    }
  }

  #validarTipo(tipo) {
    if (!TIPOS_TELEFONE_PERMITIDOS.includes(tipo)) {
      throw new Error(
        `Tipo de telefone inválido. Tipos permitidos: ${TIPOS_TELEFONE_PERMITIDOS.join(', ')}.`,
      );
    }
  }
}

module.exports = { Telefone, TIPOS_TELEFONE_PERMITIDOS };

