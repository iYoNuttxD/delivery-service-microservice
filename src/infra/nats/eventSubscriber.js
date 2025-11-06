const natsClient = require('./natsClient');
const logger = require('../../utils/logger');

class EventSubscriber {
  constructor() {
    this.subscriptions = [];
  }

  async subscribe(subject, handler) {
    try {
      const nc = natsClient.getConnection();
      if (!nc) {
        logger.warn('NATS não conectado, não é possível criar subscrição', { subject });
        return null;
      }

      const sc = natsClient.getCodec();
      const sub = nc.subscribe(subject);
      
      logger.info('📥 Inscrito no subject', { subject });

      (async () => {
        for await (const msg of sub) {
          try {
            const data = JSON.parse(sc.decode(msg.data));
            logger.info('📨 Evento recebido', { subject, data });
            await handler(data);
          } catch (error) {
            logger.error('❌ Erro ao processar evento', { 
              subject, 
              error: error.message 
            });
          }
        }
      })();

      this.subscriptions.push(sub);
      return sub;
    } catch (error) {
      logger.error('❌ Erro ao criar subscrição', { 
        subject, 
        error: error.message 
      });
      return null;
    }
  }

  async subscribeToOrderCreated(handler) {
    const subject = process.env.NATS_SUBJECT_ORDER_CREATED || 'order.created';
    return this.subscribe(subject, handler);
  }

  async unsubscribeAll() {
    logger.info('Cancelando todas as subscrições...');
    for (const sub of this.subscriptions) {
      await sub.unsubscribe();
    }
    this.subscriptions = [];
    logger.info('✅ Subscrições canceladas');
  }
}

module.exports = new EventSubscriber();
