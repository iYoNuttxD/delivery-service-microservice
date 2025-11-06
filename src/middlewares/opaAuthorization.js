const authPolicyClient = require('../infra/opa/authPolicyClient');
const logger = require('../utils/logger');

/**
 * Middleware de autorização OPA
 * Pode ser configurado com diferentes recursos e ações
 */
const opaAuthorization = (options = {}) => {
  const { 
    resource = 'delivery', 
    action = 'write',
    extractUserId = (req) => req.headers['x-user-id'] || 'anonymous'
  } = options;

  return async (req, res, next) => {
    // Se OPA não estiver configurado, permitir (modo feature flag)
    if (!process.env.OPA_URL) {
      logger.debug('OPA não configurado, pulando autorização');
      return next();
    }

    try {
      const userId = extractUserId(req);
      
      if (!userId || userId === 'anonymous') {
        logger.warn('⚠️ Usuário não autenticado tentando acessar recurso protegido', {
          path: req.path,
          method: req.method
        });
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Usuário não autenticado'
        });
      }

      const allowed = await authPolicyClient.canPerformAction(userId, resource, action);

      if (!allowed) {
        logger.warn('🚫 Acesso negado pela política OPA', {
          userId,
          resource,
          action,
          path: req.path
        });
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Você não tem permissão para executar esta ação'
        });
      }

      logger.info('✅ Acesso autorizado pela política OPA', {
        userId,
        resource,
        action
      });

      next();
    } catch (error) {
      logger.error('❌ Erro no middleware de autorização OPA', {
        error: error.message
      });
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao verificar permissões'
      });
    }
  };
};

module.exports = opaAuthorization;
