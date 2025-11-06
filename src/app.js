const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
require('dotenv').config();

const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logger');
const { getConnection, closeConnection } = require('./config/database');
const { metricsMiddleware, metricsHandler } = require('./utils/metrics');
const natsClient = require('./infra/nats/natsClient');
const eventSubscriber = require('./infra/nats/eventSubscriber');

const app = express();
const PORT = process.env.PORT || 3001;

// Metrics middleware (deve ser um dos primeiros)
app.use(metricsMiddleware);

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

const swaggerDocument = YAML.load(path.join(__dirname, '../openapi.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'Delivery Service API Docs',
  customfavIcon: '/favicon.ico',
  customCss: '.swagger-ui .topbar { display: none }'
}));

// Metrics endpoint
app.get('/metrics', metricsHandler);

// Rotas
app.use('/api/v1', routes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Delivery Service API',
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/health',
      metrics: '/metrics',
      entregadores: '/api/v1/entregadores',
      veiculos: '/api/v1/veiculos',
      alugueis: '/api/v1/alugueis',
      entregas: '/api/v1/entregas',
      tracking: '/api/v1/tracking'
    }
  });
});

// Middleware de erro (deve ser o último)
app.use(errorHandler);

// Iniciar servidor
const server = app.listen(PORT, async () => {
  console.log(`🚀 Delivery Service rodando na porta ${PORT}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);

  if (process.env.NODE_ENV === 'test') {
    logger.info('🧪 Ambiente de teste: pulando verificação de conexão com o banco.');
    return;
  }

  try {
    await getConnection();
    logger.info('✅ Banco de dados conectado');
  } catch (error) {
    logger.error('❌ Erro ao conectar ao banco:', error);
    process.exit(1);
  }

  // Inicializar NATS (se configurado)
  if (process.env.NATS_URL) {
    try {
      await natsClient.connect();
      
      // Subscrever a eventos
      await eventSubscriber.subscribeToOrderCreated(async (data) => {
        logger.info('📦 Evento order.created recebido', { data });
        // Aqui você pode criar uma entrega placeholder ou processar o pedido
        // Por enquanto, apenas registramos o evento
      });
      
      logger.info('✅ NATS conectado e subscrito a eventos');
    } catch (error) {
      logger.warn('⚠️ Erro ao conectar ao NATS (continuando sem EDA):', error.message);
    }
  } else {
    logger.info('ℹ️ NATS não configurado, rodando sem Event-Driven Architecture');
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM recebido, fechando servidor...');
  server.close(async () => {
    await closeConnection();
    await eventSubscriber.unsubscribeAll();
    await natsClient.close();
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('⚠️  SIGINT recebido, fechando servidor...');
  server.close(async () => {
    await closeConnection();
    await eventSubscriber.unsubscribeAll();
    await natsClient.close();
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});

module.exports = app;
