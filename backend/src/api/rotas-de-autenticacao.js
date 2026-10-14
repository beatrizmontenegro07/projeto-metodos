const { ErroDeAutenticacao, ErroDeValidacaoDeUsuario } = require('../domain/erros-de-usuario');
const { gerarTokenJwt } = require('../infra/servico-de-token-jwt');

function criarManipuladoresDeAutenticacao({ controladorDeUsuarios, jwtSecret, tempoExpiracaoSegundos = 7200 }) {
  function login(req, res) {
    try {
      const { login: identificador, email, senha } = req.body || {};
      const usuario = controladorDeUsuarios.autenticar({
        login: identificador ?? email,
        senha,
      });

      const token = gerarTokenJwt(
        {
          sub: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          login: usuario.login,
          papel: usuario.papel,
        },
        {
          segredo: jwtSecret,
          expiraEmSegundos: tempoExpiracaoSegundos,
        },
      );

      return res.status(200).json({
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          login: usuario.login,
          papel: usuario.papel,
        },
        token,
      });
    } catch (erro) {
      if (erro instanceof ErroDeAutenticacao) {
        return res.status(401).json({ erro: erro.message });
      }
      return res.status(500).json({ erro: 'Erro interno ao processar autenticação.' });
    }
  }

  function perfilAtual(req, res) {
    if (!req.usuario) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }
    return res.status(200).json({
      usuario: {
        id: req.usuario.id,
        nome: req.usuario.nome,
        email: req.usuario.email,
        login: req.usuario.login,
        papel: req.usuario.papel,
      },
    });
  }

  function cadastrarUsuario(req, res) {
    try {
      const { nome, email, login: loginUsuario, senha, papel } = req.body || {};
      const novoUsuario = controladorDeUsuarios.adicionar({
        nome,
        email,
        login: loginUsuario,
        senha,
        papel,
      });
      return res.status(201).json({
        usuario: {
          id: novoUsuario.id,
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          login: novoUsuario.login,
          papel: novoUsuario.papel,
        },
      });
    } catch (erro) {
      if (erro instanceof ErroDeValidacaoDeUsuario) {
        return res.status(400).json({ erro: erro.message });
      }
      return res.status(500).json({ erro: 'Erro interno ao cadastrar usuário.' });
    }
  }

  return {
    login,
    perfilAtual,
    cadastrarUsuario,
  };
}

function registrarRotasDeAutenticacao(rotas, { controladorDeUsuarios, autenticarRequisicao, jwtSecret, tempoExpiracaoSegundos }) {
  const manipuladores = criarManipuladoresDeAutenticacao({
    controladorDeUsuarios,
    jwtSecret,
    tempoExpiracaoSegundos,
  });

  rotas.push(
    {
      method: 'POST',
      path: '/api/auth/login',
      middlewares: [],
      handler: manipuladores.login,
    },
    {
      method: 'POST',
      path: '/login',
      middlewares: [],
      handler: manipuladores.login,
    },
    {
      method: 'GET',
      path: '/api/auth/me',
      middlewares: [autenticarRequisicao],
      handler: manipuladores.perfilAtual,
    },
    {
      method: 'POST',
      path: '/api/usuarios',
      middlewares: [],
      handler: manipuladores.cadastrarUsuario,
    },
  );
}

module.exports = {
  criarManipuladoresDeAutenticacao,
  registrarRotasDeAutenticacao,
};

