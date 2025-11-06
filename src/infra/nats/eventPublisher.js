const natsClient = require('./natsClient');
const logger = require('../../utils/logger');

class EventPublisher {
  async publish(subject, payload) {
    try {
      const nc = natsClient.getConnection();
      if (!nc) {
        logger.warn('NATS não conectado, pulando publicação de evento', { subject });
        return false;
      }

      const sc = natsClient.getCodec();
      const data = JSON.stringify(payload);
      
      await nc.publish(subject, sc.encode(data));
      
      logger.info('📤 Evento publicado', { subject, payload });
      return true;
    } catch (error) {
      logger.error('❌ Erro ao publicar evento', { 
        subject, 
        error: error.message 
      });
      return false;
    }
  }

  async publishDeliveryStatusChanged(deliveryId, status) {
    const subject = 'delivery.status.changed';
    const payload = {
      deliveryId,
      status,
      timestamp: new Date().toISOString()
    };
    
    return this.publish(subject, payload);
  }
}

module.exports = new EventPublisher();
