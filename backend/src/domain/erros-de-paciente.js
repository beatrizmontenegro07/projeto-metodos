class ErroDeValidacaoDePaciente extends Error {
  constructor(message) {
    super(message);
    this.name = 'ErroDeValidacaoDePaciente';
  }
}

module.exports = { ErroDeValidacaoDePaciente };

