const { connect, StringCodec } = require('nats');
const logger = require('../../utils/logger');

class NatsClient {
  constructor() {
    this.nc = null;
    this.sc = StringCodec();
  }

  async connect() {
    if (this.nc) {
      return this.nc;
    }

    const natsUrl = process.env.NATS_URL || 'nats://localhost:4222';
    const clientId = process.env.NATS_CLIENT_ID || 'delivery-service';

    try {
      logger.info('Conectando ao NATS...', { url: natsUrl, clientId });
      this.nc = await connect({
        servers: natsUrl,
        name: clientId,
        reconnect: true,
        maxReconnectAttempts: 10,
        reconnectTimeWait: 1000,
      });

      logger.info('✅ Conexão com NATS estabelecida', { url: natsUrl });

      // Handle connection events
      (async () => {
        for await (const status of this.nc.status()) {
          logger.info('Status NATS:', { 
            type: status.type, 
            data: status.data 
          });
        }
      })().catch(err => {
        logger.error('Erro no status handler do NATS', { error: err.message });
      });

      return this.nc;
    } catch (error) {
      logger.error('❌ Erro ao conectar ao NATS', { error: error.message });
      throw error;
    }
  }

  async close() {
    if (this.nc) {
      logger.info('Fechando conexão com NATS...');
      await this.nc.drain();
      this.nc = null;
      logger.info('✅ Conexão com NATS fechada');
    }
  }

  getConnection() {
    return this.nc;
  }

  getCodec() {
    return this.sc;
  }
}

module.exports = new NatsClient();
