const http = require('node:http');
const { ControladorDeUsuarios } = require('../application/controlador-de-usuarios');
const { ControladorDePacientes } = require('../application/controlador-de-pacientes');
const { criarRepositorioDeUsuarios } = require('../infra/fabrica-de-repositorio-de-usuarios');
const { criarRepositorioDePacientes } = require('../infra/fabrica-de-repositorio-de-pacientes');
const { criarMiddlewareDeAutenticacao } = require('./middleware-autenticacao');
const { registrarRotasDeAutenticacao } = require('./rotas-de-autenticacao');
const { registrarRotasDePacientes } = require('./rotas-de-pacientes');

const LIMITE_BYTES_CORPO = 64 * 1024;

function obterModoDeArmazenamentoPorArgs(argv = process.argv.slice(2)) {
  const argStorage = argv.find((arg) => arg.startsWith('--storage='));
  if (!argStorage) return 'arquivo';
  const valor = argStorage.split('=')[1];
  if (valor === 'memory' || valor === 'memoria') return 'memoria';
  if (valor === 'file' || valor === 'arquivo') return 'arquivo';
  return valor;
}

function executarCadeiaDeMiddlewares(middlewares, handler, req, res) {
  let indice = 0;

  function proximo() {
    if (res.finalizado) return undefined;
    if (indice < middlewares.length) {
      const mw = middlewares[indice];
      indice += 1;
      return mw(req, res, proximo);
    }
    return handler(req, res);
  }

  return proximo();
}

/**
 * Compara o padrão da rota (ex.: /api/pacientes/:id) com o caminho requisitado.
 * Retorna os parâmetros extraídos ou null quando não há correspondência.
 */
function casarCaminho(padrao, caminho) {
  const partesPadrao = padrao.split('/');
  const partesCaminho = caminho.split('/');
  if (partesPadrao.length !== partesCaminho.length) return null;

  const params = {};
  for (let i = 0; i < partesPadrao.length; i += 1) {
    const segmento = partesPadrao[i];
    if (segmento.startsWith(':')) {
      if (!partesCaminho[i]) return null;
      params[segmento.slice(1)] = decodeURIComponent(partesCaminho[i]);
    } else if (segmento !== partesCaminho[i]) {
      return null;
    }
  }
  return params;
}

function criarAplicacao({
  controladorDeUsuarios,
  controladorDePacientes,
  jwtSecret = process.env.JWT_SECRET,
  tempoExpiracaoSegundos = 7200,
  configurarRotasExtras,
} = {}) {
  const controlador = controladorDeUsuarios
    || new ControladorDeUsuarios(criarRepositorioDeUsuarios({ modo: obterModoDeArmazenamentoPorArgs() }));
  const pacientes = controladorDePacientes
    || new ControladorDePacientes(criarRepositorioDePacientes({ modo: obterModoDeArmazenamentoPorArgs() }));

  const autenticarRequisicao = criarMiddlewareDeAutenticacao({
    jwtSecret,
    controladorDeUsuarios: controlador,
  });

  const rotas = [];
  registrarRotasDeAutenticacao(rotas, {
    controladorDeUsuarios: controlador,
    autenticarRequisicao,
    jwtSecret,
    tempoExpiracaoSegundos,
  });
  registrarRotasDePacientes(rotas, {
    controladorDePacientes: pacientes,
    autenticarRequisicao,
  });

  if (typeof configurarRotasExtras === 'function') {
    configurarRotasExtras(rotas, { autenticarRequisicao, controladorDeUsuarios: controlador });
  }

  async function simularRequisicao({ method = 'GET', url = '/', headers = {}, body = undefined } = {}) {
    const metodoNormalizado = method.toUpperCase();
    const [caminhoSemQuery, queryString = ''] = url.split('?');

    const cabecalhosNormalizados = {};
    for (const [chave, valor] of Object.entries(headers)) {
      cabecalhosNormalizados[chave.toLowerCase()] = valor;
    }

    const req = {
      method: metodoNormalizado,
      url: caminhoSemQuery,
      headers: cabecalhosNormalizados,
      query: Object.fromEntries(new URLSearchParams(queryString)),
      params: {},
      body,
    };

    let statusCode = 200;
    let corpoResposta;
    const cabecalhosResposta = {
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'cache-control': 'no-store',
    };

    const res = {
      finalizado: false,
      status(codigo) {
        statusCode = codigo;
        return this;
      },
      setHeader(nome, valor) {
        cabecalhosResposta[nome.toLowerCase()] = valor;
        return this;
      },
      json(dados) {
        cabecalhosResposta['content-type'] = 'application/json; charset=utf-8';
        corpoResposta = dados;
        this.finalizado = true;
        return { status: statusCode, headers: cabecalhosResposta, body: corpoResposta };
      },
    };

    if (metodoNormalizado === 'OPTIONS') {
      return { status: 204, headers: cabecalhosResposta, body: null };
    }

    let rotaEncontrada;
    for (const rota of rotas) {
      if (rota.method.toUpperCase() !== metodoNormalizado) continue;
      const params = casarCaminho(rota.path, caminhoSemQuery);
      if (params) {
        rotaEncontrada = rota;
        req.params = params;
        break;
      }
    }

    if (!rotaEncontrada) {
      res.status(404).json({ erro: 'Rota não encontrada.' });
      return { status: statusCode, headers: cabecalhosResposta, body: corpoResposta };
    }

    await executarCadeiaDeMiddlewares(rotaEncontrada.middlewares || [], rotaEncontrada.handler, req, res);
    return { status: statusCode, headers: cabecalhosResposta, body: corpoResposta };
  }

  function lerCorpoJsonHttp(reqHttp) {
    return new Promise((resolve, reject) => {
      let acumulado = '';
      let bytesRecebidos = 0;

      reqHttp.on('data', (chunk) => {
        bytesRecebidos += chunk.length;
        if (bytesRecebidos > LIMITE_BYTES_CORPO) {
          reject(new Error('PAYLOAD_TOO_LARGE'));
          reqHttp.destroy();
          return;
        }
        acumulado += chunk.toString('utf8');
      });

      reqHttp.on('end', () => {
        if (!acumulado.trim()) {
          resolve({});
          return;
        }
        try {
          resolve(JSON.parse(acumulado));
        } catch {
          reject(new Error('INVALID_JSON'));
        }
      });

      reqHttp.on('error', reject);
    });
  }

  function criarServidorHttp() {
    return http.createServer(async (reqHttp, resHttp) => {
      resHttp.setHeader('Access-Control-Allow-Origin', '*');
      resHttp.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      resHttp.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      resHttp.setHeader('X-Content-Type-Options', 'nosniff');
      resHttp.setHeader('X-Frame-Options', 'DENY');
      resHttp.setHeader('Cache-Control', 'no-store');

      if (reqHttp.method === 'OPTIONS') {
        resHttp.statusCode = 204;
        resHttp.end();
        return;
      }

      let body = {};
      if (['POST', 'PUT', 'PATCH'].includes(reqHttp.method)) {
        try {
          body = await lerCorpoJsonHttp(reqHttp);
        } catch (erro) {
          const status = erro.message === 'PAYLOAD_TOO_LARGE' ? 413 : 400;
          const mensagem = erro.message === 'PAYLOAD_TOO_LARGE'
            ? 'Tamanho da requisição excede o limite permitido.'
            : 'JSON malformado no corpo da requisição.';
          resHttp.statusCode = status;
          resHttp.setHeader('Content-Type', 'application/json; charset=utf-8');
          resHttp.end(JSON.stringify({ erro: mensagem }));
          return;
        }
      }

      const resultado = await simularRequisicao({
        method: reqHttp.method,
        url: reqHttp.url,
        headers: reqHttp.headers,
        body,
      });

      resHttp.statusCode = resultado.status;
      resHttp.setHeader('Content-Type', 'application/json; charset=utf-8');
      resHttp.end(JSON.stringify(resultado.body ?? {}));
    });
  }

  return {
    simularRequisicao,
    criarServidorHttp,
    listen(...args) {
      const servidor = criarServidorHttp();
      return servidor.listen(...args);
    },
  };
}

module.exports = {
  criarAplicacao,
  obterModoDeArmazenamentoPorArgs,
};

