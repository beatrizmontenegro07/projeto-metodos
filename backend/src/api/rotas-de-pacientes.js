const { Papel } = require('../domain/papel');
const {
  ErroDeValidacaoDePaciente,
  ErroDePacienteNaoEncontrado,
  ErroDePacienteDuplicado,
} = require('../domain/erros-de-paciente');
const { exigirPapel } = require('./middleware-autenticacao');

const PAPEIS_GESTORES_DE_PACIENTES = Object.freeze([Papel.ADMINISTRADOR, Papel.RECEPCIONISTA]);

function responderErro(res, erro) {
  if (erro instanceof ErroDeValidacaoDePaciente) {
    return res.status(400).json({ erro: erro.message });
  }
  if (erro instanceof ErroDePacienteNaoEncontrado) {
    return res.status(404).json({ erro: erro.message });
  }
  if (erro instanceof ErroDePacienteDuplicado) {
    return res.status(409).json({ erro: erro.message });
  }
  return res.status(500).json({ erro: 'Erro interno ao processar a requisição de pacientes.' });
}

function criarManipuladoresDePacientes({ controladorDePacientes }) {
  return {
    listar(req, res) {
      try {
        const { pagina, tamanhoPagina, busca, status, ordenacao } = req.query || {};
        const resultado = controladorDePacientes.listarPaginado({
          ...(pagina !== undefined && { pagina }),
          ...(tamanhoPagina !== undefined && { tamanhoPagina }),
          ...(busca !== undefined && { busca }),
          ...(status !== undefined && { status }),
          ...(ordenacao !== undefined && { ordenacao }),
        });
        return res.status(200).json(resultado);
      } catch (erro) {
        return responderErro(res, erro);
      }
    },

    obter(req, res) {
      try {
        return res.status(200).json({ paciente: controladorDePacientes.obterPorId(req.params.id) });
      } catch (erro) {
        return responderErro(res, erro);
      }
    },

    cadastrar(req, res) {
      try {
        return res.status(201).json({ paciente: controladorDePacientes.cadastrar(req.body) });
      } catch (erro) {
        return responderErro(res, erro);
      }
    },

    atualizar(req, res) {
      try {
        return res.status(200).json({
          paciente: controladorDePacientes.atualizar(req.params.id, req.body),
        });
      } catch (erro) {
        return responderErro(res, erro);
      }
    },

    remover(req, res) {
      try {
        controladorDePacientes.remover(req.params.id);
        return res.status(200).json({ mensagem: 'Paciente removido com sucesso.' });
      } catch (erro) {
        return responderErro(res, erro);
      }
    },
  };
}

function registrarRotasDePacientes(rotas, { controladorDePacientes, autenticarRequisicao }) {
  const m = criarManipuladoresDePacientes({ controladorDePacientes });
  const protecao = [autenticarRequisicao, exigirPapel(...PAPEIS_GESTORES_DE_PACIENTES)];

  rotas.push(
    { method: 'GET', path: '/api/pacientes', middlewares: protecao, handler: m.listar },
    { method: 'POST', path: '/api/pacientes', middlewares: protecao, handler: m.cadastrar },
    { method: 'GET', path: '/api/pacientes/:id', middlewares: protecao, handler: m.obter },
    { method: 'PUT', path: '/api/pacientes/:id', middlewares: protecao, handler: m.atualizar },
    { method: 'DELETE', path: '/api/pacientes/:id', middlewares: protecao, handler: m.remover },
  );
}

module.exports = {
  PAPEIS_GESTORES_DE_PACIENTES,
  criarManipuladoresDePacientes,
  registrarRotasDePacientes,
};
