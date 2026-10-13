const path = require('node:path');
const { criarAplicacao, obterModoDeArmazenamentoPorArgs } = require('./criar-aplicacao');
const { ControladorDeUsuarios } = require('../application/controlador-de-usuarios');
const { criarRepositorioDeUsuarios } = require('../infra/fabrica-de-repositorio-de-usuarios');

const porta = Number(process.env.PORT) || 3000;
const modo = obterModoDeArmazenamentoPorArgs();
const arquivo = path.resolve(__dirname, '../../usuarios.bin');
const repositorio = criarRepositorioDeUsuarios({ modo, arquivo });
const controladorDeUsuarios = new ControladorDeUsuarios(repositorio);

const app = criarAplicacao({ controladorDeUsuarios });

app.listen(porta, () => {
  console.log(`Servidor CliniCore iniciado na porta ${porta} (persistência: ${modo})`);
});

