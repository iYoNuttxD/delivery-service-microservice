const natsClient = require('./natsClient');
const logger = require('../utils/logger');

class EventSubscriber {
  constructor() {
    this.handlers = new Map();
  }

  async initialize() {
    // Don't initialize if NATS URL is not configured
    if (!process.env.NATS_URL) {
      logger.info('EventSubscriber não inicializado: NATS_URL não configurado');
      return;
    }

    // Wait for NATS connection if not already connected
    if (!natsClient.isConnected) {
      logger.warn('NATS não conectado ainda. EventSubscriber aguardando conexão.');
      return;
    }

    // Subscribe to order created events if configured
    const orderCreatedSubject = process.env.ORDER_CREATED_SUBJECT;
    if (orderCreatedSubject) {
      await this.subscribeToOrderCreated(orderCreatedSubject);
    }

    // Subscribe to additional subjects if configured
    const additionalSubjects = process.env.ADDITIONAL_SUBJECTS;
    if (additionalSubjects) {
      const subjects = additionalSubjects.split(',').map(s => s.trim());
      for (const subject of subjects) {
        if (subject) {
          await this.subscribeToSubject(subject);
        }
      }
    }
  }

  async subscribeToOrderCreated(subject) {
    try {
      await natsClient.subscribe(subject, async (data) => {
        logger.info('Evento de pedido criado recebido', { data });
        
        try {
          // Process the order created event
          // This is a placeholder for the actual business logic
          // In a real implementation, this might create a delivery, notify drivers, etc.
          await this.handleOrderCreated(data);
        } catch (error) {
          logger.error('Erro ao processar evento de pedido criado', { 
            error: error.message,
            data 
          });
        }
      });

      logger.info('Inscrito em eventos de pedido criado', { subject });
    } catch (error) {
      logger.error('Erro ao inscrever em eventos de pedido criado', { 
        subject,
        error: error.message 
      });
    }
  }

  async subscribeToSubject(subject) {
    try {
      await natsClient.subscribe(subject, async (data) => {
        logger.info('Evento recebido', { subject, data });
        
        // Check if there's a registered handler for this subject
        const handler = this.handlers.get(subject);
        if (handler) {
          try {
            await handler(data);
          } catch (error) {
            logger.error('Erro ao executar handler do subject', { 
              subject,
              error: error.message 
            });
          }
        }
      });

      logger.info('Inscrito em subject', { subject });
    } catch (error) {
      logger.error('Erro ao inscrever em subject', { 
        subject,
        error: error.message 
      });
    }
  }

  registerHandler(subject, handler) {
    this.handlers.set(subject, handler);
    logger.info('Handler registrado para subject', { subject });
  }

  async handleOrderCreated(data) {
    // This is a placeholder implementation
    // In a real scenario, you might:
    // 1. Validate the order data
    // 2. Find available delivery drivers
    // 3. Create a delivery assignment
    // 4. Notify the assigned driver
    
    logger.info('Processando pedido criado', {
      orderId: data.orderId || data.id,
      customerId: data.customerId,
      timestamp: data.timestamp
    });

    // Example: Log the order for internal handling
    // You could enqueue this for processing, create a delivery record, etc.
    
    // If you have a delivery service, you might call:
    // await deliveryService.createDeliveryFromOrder(data);
  }
}

module.exports = new EventSubscriber();
