const path = require('node:path');
const { criarAplicacao, obterModoDeArmazenamentoPorArgs } = require('./criar-aplicacao');
const { ControladorDeUsuarios } = require('../application/controlador-de-usuarios');
const { ControladorDePacientes } = require('../application/controlador-de-pacientes');
const { criarRepositorioDeUsuarios } = require('../infra/fabrica-de-repositorio-de-usuarios');
const { criarRepositorioDePacientes } = require('../infra/fabrica-de-repositorio-de-pacientes');

const porta = Number(process.env.PORT) || 3000;
const modo = obterModoDeArmazenamentoPorArgs();

const repositorioDeUsuarios = criarRepositorioDeUsuarios({
  modo,
  arquivo: path.resolve(__dirname, '../../usuarios.bin'),
});
const repositorioDePacientes = criarRepositorioDePacientes({
  modo,
  arquivo: path.resolve(__dirname, '../../pacientes.bin'),
});

const controladorDeUsuarios = new ControladorDeUsuarios(repositorioDeUsuarios);
const controladorDePacientes = new ControladorDePacientes(repositorioDePacientes);

const app = criarAplicacao({ controladorDeUsuarios, controladorDePacientes });

app.listen(porta, () => {
  console.log(`Servidor CliniCore iniciado na porta ${porta} (persistência: ${modo})`);
});
