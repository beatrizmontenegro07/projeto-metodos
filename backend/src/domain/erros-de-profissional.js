class ErroDeValidacaoDeProfissional extends Error {
  constructor(message) {
    super(message);
    this.name = 'ErroDeValidacaoDeProfissional';
  }
}

module.exports = { ErroDeValidacaoDeProfissional };

