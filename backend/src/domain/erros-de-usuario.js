class ErroDeValidacaoDeUsuario extends Error { }
class ErroDePersistenciaDeUsuarios extends Error { }
class ErroDeAutenticacao extends Error { }
class ErroDeAutorizacao extends Error { }

module.exports = {
  ErroDeValidacaoDeUsuario,
  ErroDePersistenciaDeUsuarios,
  ErroDeAutenticacao,
  ErroDeAutorizacao,
};
