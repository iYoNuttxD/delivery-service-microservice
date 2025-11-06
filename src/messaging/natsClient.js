const { connect, StringCodec } = require('nats');
const logger = require('../utils/logger');

class NatsClient {
  constructor() {
    this.connection = null;
    this.stringCodec = StringCodec();
    this.isConnected = false;
    this.subscriptions = [];
  }

  async connect() {
    const natsUrl = process.env.NATS_URL;
    
    if (!natsUrl) {
      logger.info('NATS_URL não configurado. Mensageria desabilitada.');
      return null;
    }

    try {
      logger.info('Conectando ao NATS...', { url: natsUrl });
      
      const options = {
        servers: natsUrl,
        name: process.env.NATS_CLIENT_NAME || 'delivery-service',
        maxReconnectAttempts: parseInt(process.env.NATS_MAX_RECONNECT_ATTEMPTS, 10) || 10,
        reconnectTimeWait: parseInt(process.env.NATS_RECONNECT_TIME_WAIT, 10) || 2000,
      };

      // Add authentication if provided
      if (process.env.NATS_USER && process.env.NATS_PASSWORD) {
        options.user = process.env.NATS_USER;
        options.pass = process.env.NATS_PASSWORD;
      }

      // Add token authentication if provided
      if (process.env.NATS_TOKEN) {
        options.token = process.env.NATS_TOKEN;
      }

      this.connection = await connect(options);
      this.isConnected = true;

      logger.info('Conectado ao NATS com sucesso', { 
        server: this.connection.getServer() 
      });

      // Handle connection events
      (async () => {
        for await (const status of this.connection.status()) {
          logger.info('NATS status change', { 
            type: status.type,
            data: status.data 
          });
          
          if (status.type === 'disconnect' || status.type === 'error') {
            this.isConnected = false;
          } else if (status.type === 'reconnect') {
            this.isConnected = true;
          }
        }
      })();

      // Handle graceful shutdown
      (async () => {
        await this.connection.closed();
        logger.info('Conexão NATS fechada');
        this.isConnected = false;
      })();

      return this.connection;
    } catch (error) {
      logger.error('Erro ao conectar ao NATS', { error: error.message });
      this.isConnected = false;
      throw error;
    }
  }

  async publish(subject, data) {
    if (!this.isConnected || !this.connection) {
      logger.warn('NATS não conectado. Mensagem não enviada.', { subject, data });
      return false;
    }

    try {
      const payload = JSON.stringify(data);
      this.connection.publish(subject, this.stringCodec.encode(payload));
      logger.debug('Mensagem publicada no NATS', { subject, data });
      return true;
    } catch (error) {
      logger.error('Erro ao publicar mensagem no NATS', { 
        subject, 
        error: error.message 
      });
      return false;
    }
  }

  async subscribe(subject, handler) {
    if (!this.isConnected || !this.connection) {
      logger.warn('NATS não conectado. Assinatura não criada.', { subject });
      return null;
    }

    try {
      const subscription = this.connection.subscribe(subject);
      this.subscriptions.push(subscription);
      
      logger.info('Inscrito no subject NATS', { subject });

      (async () => {
        for await (const msg of subscription) {
          try {
            const data = JSON.parse(this.stringCodec.decode(msg.data));
            logger.debug('Mensagem recebida do NATS', { subject, data });
            await handler(data, msg);
          } catch (error) {
            logger.error('Erro ao processar mensagem do NATS', { 
              subject, 
              error: error.message 
            });
          }
        }
      })();

      return subscription;
    } catch (error) {
      logger.error('Erro ao criar assinatura no NATS', { 
        subject, 
        error: error.message 
      });
      return null;
    }
  }

  async close() {
    if (this.connection) {
      try {
        // Drain subscriptions first
        for (const sub of this.subscriptions) {
          await sub.drain();
        }
        
        // Close connection
        await this.connection.drain();
        await this.connection.close();
        
        this.isConnected = false;
        this.subscriptions = [];
        
        logger.info('Conexão NATS encerrada com sucesso');
      } catch (error) {
        logger.error('Erro ao fechar conexão NATS', { error: error.message });
      }
    }
  }

  getStatus() {
    return {
      connected: this.isConnected,
      server: this.isConnected && this.connection ? this.connection.getServer() : null,
      subscriptions: this.subscriptions.length
    };
  }
}

module.exports = new NatsClient();
