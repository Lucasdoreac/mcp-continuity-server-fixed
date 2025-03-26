/**
 * Módulo de autenticação básica para a interface web
 * @module web/auth
 */

import dotenv from 'dotenv';

// Garantir que as variáveis de ambiente estejam carregadas
dotenv.config();

/**
 * Middleware para autenticação HTTP básica
 * @param {Object} options - Opções de configuração
 * @param {boolean} options.enabled - Se a autenticação está habilitada
 * @param {string} options.realm - Nome do realm para o cabeçalho WWW-Authenticate
 * @returns {Function} Middleware Express
 */
export function basicAuthMiddleware(options = {}) {
  // Opções padrão
  const config = {
    enabled: process.env.AUTH_ENABLED === 'true',
    realm: process.env.AUTH_REALM || 'MCP Continuity Server',
    username: process.env.AUTH_USERNAME || 'admin',
    password: process.env.AUTH_PASSWORD || 'password',
    ...options
  };

  // Se a autenticação não estiver habilitada, retorna um middleware que apenas chama next()
  if (!config.enabled) {
    return (req, res, next) => next();
  }

  // Retorna o middleware de autenticação
  return (req, res, next) => {
    // Se a requisição for para a rota /api/status, permitir sem autenticação
    if (req.path === '/api/status') {
      return next();
    }

    // Obter o cabeçalho de autorização
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // Não há cabeçalho de autorização, solicitar autenticação
      return unauthorized(res, config.realm);
    }

    // Verificar se é autenticação básica
    const auth = authHeader.split(' ');
    if (auth[0] !== 'Basic') {
      return unauthorized(res, config.realm);
    }

    // Decodificar as credenciais
    const credentials = Buffer.from(auth[1], 'base64').toString().split(':');
    const username = credentials[0];
    const password = credentials[1];

    // Verificar as credenciais
    if (username !== config.username || password !== config.password) {
      console.error('[ERRO] Tentativa de autenticação falhou:', username);
      return unauthorized(res, config.realm);
    }

    // Autenticação bem-sucedida
    next();
  };
}

/**
 * Função auxiliar para enviar resposta 401 Unauthorized
 * @param {Object} res - Objeto de resposta Express
 * @param {string} realm - Nome do realm para o cabeçalho WWW-Authenticate
 */
function unauthorized(res, realm) {
  res.set('WWW-Authenticate', `Basic realm="${realm}"`);
  res.status(401).send('Acesso não autorizado');
}

export default { basicAuthMiddleware };
