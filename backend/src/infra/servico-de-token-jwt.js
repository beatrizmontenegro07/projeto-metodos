const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { ErroDeAutenticacao } = require('../domain/erros-de-usuario');

function carregarJwtSecretDoEnvSeNecessario() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  const caminhosEnv = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../../../.env'),
  ];
  for (const caminho of caminhosEnv) {
    if (fs.existsSync(caminho)) {
      const conteudo = fs.readFileSync(caminho, 'utf8');
      for (const linha of conteudo.split(/\r?\n/)) {
        const match = linha.match(/^\s*JWT_SECRET\s*=\s*(.*)\s*$/);
        if (match) {
          const valor = match[1].replace(/^['"]|['"]$/g, '').trim();
          if (valor) {
            process.env.JWT_SECRET = valor;
            return valor;
          }
        }
      }
    }
  }
  return undefined;
}

function obterSegredoJwt(segredoExplicito) {
  const segredo = segredoExplicito ?? carregarJwtSecretDoEnvSeNecessario();
  if (typeof segredo !== 'string' || segredo.trim().length === 0) {
    throw new Error('JWT_SECRET não está configurado.');
  }
  return segredo;
}

function codificarBase64Url(dados) {
  const buffer = Buffer.isBuffer(dados) ? dados : Buffer.from(dados, 'utf8');
  return buffer.toString('base64url');
}

function decodificarBase64UrlParaString(textoBase64Url) {
  return Buffer.from(textoBase64Url, 'base64url').toString('utf8');
}

function assinarHs256(conteudo, segredo) {
  return crypto.createHmac('sha256', segredo).update(conteudo).digest('base64url');
}

function gerarTokenJwt(payload, { segredo, expiraEmSegundos = 7200 } = {}) {
  const chaveSecreta = obterSegredoJwt(segredo);
  const agora = Math.floor(Date.now() / 1000);

  const cabecalho = { alg: 'HS256', typ: 'JWT' };
  const corpo = {
    ...payload,
    iat: agora,
    exp: agora + expiraEmSegundos,
  };

  const cabecalhoCodificado = codificarBase64Url(JSON.stringify(cabecalho));
  const corpoCodificado = codificarBase64Url(JSON.stringify(corpo));
  const conteudoAssinavel = `${cabecalhoCodificado}.${corpoCodificado}`;
  const assinatura = assinarHs256(conteudoAssinavel, chaveSecreta);

  return `${conteudoAssinavel}.${assinatura}`;
}

function verificarTokenJwt(token, { segredo } = {}) {
  if (typeof token !== 'string' || token.trim().length === 0) {
    throw new ErroDeAutenticacao('Token de autenticação ausente ou malformado.');
  }

  const partes = token.split('.');
  if (partes.length !== 3) {
    throw new ErroDeAutenticacao('Formato de token JWT inválido.');
  }

  const [cabecalhoCodificado, corpoCodificado, assinaturaRecebida] = partes;
  const chaveSecreta = obterSegredoJwt(segredo);

  const conteudoAssinavel = `${cabecalhoCodificado}.${corpoCodificado}`;
  const assinaturaEsperada = assinarHs256(conteudoAssinavel, chaveSecreta);

  const bufRecebida = Buffer.from(assinaturaRecebida, 'utf8');
  const bufEsperada = Buffer.from(assinaturaEsperada, 'utf8');

  if (bufRecebida.length !== bufEsperada.length || !crypto.timingSafeEqual(bufRecebida, bufEsperada)) {
    throw new ErroDeAutenticacao('Assinatura do token JWT inválida.');
  }

  let cabecalho;
  let payload;
  try {
    cabecalho = JSON.parse(decodificarBase64UrlParaString(cabecalhoCodificado));
    payload = JSON.parse(decodificarBase64UrlParaString(corpoCodificado));
  } catch {
    throw new ErroDeAutenticacao('Conteúdo do token JWT corrompido.');
  }

  if (cabecalho.alg !== 'HS256' || cabecalho.typ !== 'JWT') {
    throw new ErroDeAutenticacao('Algoritmo de token JWT não suportado.');
  }

  const agora = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== 'number' || agora >= payload.exp) {
    throw new ErroDeAutenticacao('Token de autenticação expirado.');
  }

  return payload;
}

module.exports = {
  gerarTokenJwt,
  verificarTokenJwt,
  obterSegredoJwt,
};

