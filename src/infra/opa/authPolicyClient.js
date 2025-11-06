const axios = require('axios');
const logger = require('../../utils/logger');

class AuthPolicyClient {
  constructor() {
    this.opaUrl = process.env.OPA_URL || 'http://localhost:8181';
  }

  async evaluate(input) {
    try {
      const url = `${this.opaUrl}/v1/data/delivery/allow`;
      
      logger.info('🔐 Avaliando política OPA', { url, input });

      const response = await axios.post(url, { input }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      const allowed = response.data?.result || false;
      
      logger.info('✅ Política avaliada', { allowed, input });
      
      return allowed;
    } catch (error) {
      logger.error('❌ Erro ao avaliar política OPA', { 
        error: error.message,
        input
      });
      
      // Em caso de erro de comunicação com OPA, negar por segurança
      return false;
    }
  }

  async canAccessDelivery(userId, deliveryId, action) {
    return this.evaluate({
      user: userId,
      deliveryId,
      action,
      resource: 'delivery'
    });
  }

  async canPerformAction(userId, resource, action) {
    return this.evaluate({
      user: userId,
      resource,
      action
    });
  }
}

module.exports = new AuthPolicyClient();
