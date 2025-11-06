const natsClient = require('./natsClient');
const logger = require('../utils/logger');

class EventPublisher {
  constructor() {
    this.deliveryStatusSubject = process.env.DELIVERY_STATUS_SUBJECT || 'delivery.status.changed';
  }

  async publishDeliveryStatusChange(deliveryId, status, additionalData = {}) {
    const event = {
      deliveryId,
      status,
      timestamp: new Date().toISOString(),
      ...additionalData
    };

    try {
      const success = await natsClient.publish(this.deliveryStatusSubject, event);
      
      if (success) {
        logger.info('Evento de mudança de status publicado', { 
          deliveryId, 
          status,
          subject: this.deliveryStatusSubject 
        });
      } else {
        logger.warn('Falha ao publicar evento de mudança de status', { 
          deliveryId, 
          status 
        });
      }
      
      return success;
    } catch (error) {
      logger.error('Erro ao publicar evento de mudança de status', { 
        deliveryId, 
        status, 
        error: error.message 
      });
      return false;
    }
  }

  async publishDeliveryCreated(delivery) {
    const subject = process.env.DELIVERY_CREATED_SUBJECT || 'delivery.created';
    
    const event = {
      deliveryId: delivery.Id,
      pedidoId: delivery.PedidoId,
      entregadorId: delivery.EntregadorId,
      status: delivery.Status,
      timestamp: new Date().toISOString()
    };

    try {
      const success = await natsClient.publish(subject, event);
      
      if (success) {
        logger.info('Evento de entrega criada publicado', { 
          deliveryId: delivery.Id,
          subject 
        });
      }
      
      return success;
    } catch (error) {
      logger.error('Erro ao publicar evento de entrega criada', { 
        deliveryId: delivery.Id, 
        error: error.message 
      });
      return false;
    }
  }

  async publishDeliveryCompleted(delivery) {
    const subject = process.env.DELIVERY_COMPLETED_SUBJECT || 'delivery.completed';
    
    const event = {
      deliveryId: delivery.Id,
      pedidoId: delivery.PedidoId,
      entregadorId: delivery.EntregadorId,
      horaEntrega: delivery.HoraEntrega,
      timestamp: new Date().toISOString()
    };

    try {
      const success = await natsClient.publish(subject, event);
      
      if (success) {
        logger.info('Evento de entrega concluída publicado', { 
          deliveryId: delivery.Id,
          subject 
        });
      }
      
      return success;
    } catch (error) {
      logger.error('Erro ao publicar evento de entrega concluída', { 
        deliveryId: delivery.Id, 
        error: error.message 
      });
      return false;
    }
  }
}

module.exports = new EventPublisher();
