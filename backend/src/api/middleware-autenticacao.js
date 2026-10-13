const { ErroDeAutenticacao } = require('../domain/erros-de-usuario');
const { verificarTokenJwt } = require('../infra/servico-de-token-jwt');

function extrairBearerToken(cabecalhoAutorizacao) {
  if (typeof cabecalhoAutorizacao !== 'string') return null;
  const partes = cabecalhoAutorizacao.trim().split(/\s+/);
  if (partes.length !== 2 || partes[0].toLowerCase() !== 'bearer') return null;
  return partes[1];
}

function criarMiddlewareDeAutenticacao({ jwtSecret, controladorDeUsuarios } = {}) {
  return function autenticarRequisicao(req, res, next) {
    try {
      const cabecalho = req.headers?.authorization || req.headers?.Authorization;
      const token = extrairBearerToken(cabecalho);
      if (!token) {
        return res.status(401).json({ erro: 'Token de autenticação não fornecido.' });
      }

      const payload = verificarTokenJwt(token, { segredo: jwtSecret });

      if (controladorDeUsuarios && typeof controladorDeUsuarios.obterPorId === 'function') {
        const usuarioAtual = controladorDeUsuarios.obterPorId(payload.sub);
        if (!usuarioAtual) {
          return res.status(401).json({ erro: 'Usuário associado ao token não encontrado.' });
        }
        req.usuario = usuarioAtual;
      } else {
        req.usuario = {
          id: payload.sub,
          nome: payload.nome,
          email: payload.email,
          login: payload.login,
          papel: payload.papel,
        };
      }

      return next();
    } catch (erro) {
      if (erro instanceof ErroDeAutenticacao) {
        return res.status(401).json({ erro: erro.message });
      }
      return res.status(500).json({ erro: 'Falha ao validar autenticação.' });
    }
  };
}

function exigirPapel(...papeisPermitidos) {
  return function verificarAutorizacaoDePapel(req, res, next) {
    if (!req.usuario) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }
    if (!papeisPermitidos.includes(req.usuario.papel)) {
      return res.status(403).json({ erro: 'Acesso negado para o perfil do usuário.' });
    }
    return next();
  };
}

module.exports = {
  criarMiddlewareDeAutenticacao,
  exigirPapel,
  extrairBearerToken,
};

