const axios = require('axios');
const logger = require('../../utils/logger');

class AuthPolicyClient {
  constructor() {
    this.opaUrl = process.env.OPA_URL;
    this.opaPolicyPath = process.env.OPA_POLICY_PATH || 'v1/data/delivery/authz/allow';
    this.enabled = !!this.opaUrl;
    this.timeout = parseInt(process.env.OPA_TIMEOUT, 10) || 5000;
    
    if (!this.enabled) {
      logger.info('OPA não configurado. Autorização por políticas desabilitada.');
    } else {
      logger.info('OPA configurado', { url: this.opaUrl, policyPath: this.opaPolicyPath });
    }
  }

  async checkAuthorization(input) {
    if (!this.enabled) {
      // If OPA is not configured, allow all requests (fail open)
      // In production, you might want to fail closed instead
      logger.debug('OPA desabilitado. Autorização permitida por padrão.');
      return { allowed: true, reason: 'OPA not configured' };
    }

    try {
      const url = `${this.opaUrl}/${this.opaPolicyPath}`;
      
      logger.debug('Verificando autorização via OPA', { url, input });

      const response = await axios.post(
        url,
        { input },
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const allowed = response.data?.result === true || response.data?.result?.allow === true;
      
      logger.debug('Resposta do OPA', { 
        allowed, 
        result: response.data?.result 
      });

      return {
        allowed,
        result: response.data?.result,
        reason: response.data?.result?.reason || null
      };
    } catch (error) {
      logger.error('Erro ao consultar OPA', { 
        error: error.message,
        input 
      });

      // Fail open or closed based on configuration
      const failOpen = process.env.OPA_FAIL_OPEN === 'true';
      
      if (failOpen) {
        logger.warn('OPA falhou. Permitindo acesso (fail-open).');
        return { 
          allowed: true, 
          reason: 'OPA error - fail open',
          error: error.message 
        };
      } else {
        logger.warn('OPA falhou. Negando acesso (fail-closed).');
        return { 
          allowed: false, 
          reason: 'OPA error - fail closed',
          error: error.message 
        };
      }
    }
  }

  async authorizeDeliveryAccess(userId, deliveryId, action) {
    const input = {
      user: { id: userId },
      resource: { type: 'delivery', id: deliveryId },
      action: action
    };

    return await this.checkAuthorization(input);
  }

  async authorizeDriverAction(driverId, action, resourceType, resourceId) {
    const input = {
      user: { id: driverId, role: 'driver' },
      resource: { type: resourceType, id: resourceId },
      action: action
    };

    return await this.checkAuthorization(input);
  }

  async authorizeAdminAction(adminId, action, resourceType) {
    const input = {
      user: { id: adminId, role: 'admin' },
      resource: { type: resourceType },
      action: action
    };

    return await this.checkAuthorization(input);
  }

  isEnabled() {
    return this.enabled;
  }

  getStatus() {
    return {
      enabled: this.enabled,
      url: this.enabled ? this.opaUrl : null,
      policyPath: this.enabled ? this.opaPolicyPath : null
    };
  }
}

module.exports = new AuthPolicyClient();
