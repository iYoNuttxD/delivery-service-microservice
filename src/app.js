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
const metricsMiddleware = require('./middlewares/metricsMiddleware');
const logger = require('./utils/logger');
const { getConnection, closeConnection } = require('./config/database');
const natsClient = require('./messaging/natsClient');
const eventSubscriber = require('./messaging/EventSubscriber');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(metricsMiddleware);

// Swagger
const swaggerDocument = YAML.load(path.join(__dirname, '../openapi.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'Delivery Service API Docs',
  customfavIcon: '/favicon.ico',
  customCss: '.swagger-ui .topbar { display: none }'
}));

// Rotas
app.use('/api/v1', routes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Delivery Service API',
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/health',
      entregadores: '/api/v1/entregadores',
      veiculos: '/api/v1/veiculos',
      alugueis: '/api/v1/alugueis',
      entregas: '/api/v1/entregas'
    }
  });
});

// Middleware de erro (deve ser o último)
app.use(errorHandler);

// Bootstrap do servidor (não executar em ambiente de teste)
let server;

async function startServer() {
  server = app.listen(PORT, async () => {
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

    // Inicializa NATS se configurado
    try {
      await natsClient.connect();
      if (natsClient.isConnected) {
        logger.info('✅ NATS conectado');

        // Inicializa assinante de eventos
        await eventSubscriber.initialize();
        logger.info('✅ Event Subscriber inicializado');
      }
    } catch (error) {
      logger.warn('⚠️  NATS não disponível. Continuando sem mensageria.', { error: error.message });
    }
  });
}

// Apenas inicia o servidor quando o arquivo é executado diretamente e não em testes
if (require.main === module && process.env.NODE_ENV !== 'test') {
  startServer();
}

// Encerramento gracioso
async function shutdown() {
  try {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  } catch (e) {
    // noop
  }

  try {
    await closeConnection();
  } catch (e) {
    // noop
  }

  try {
    await natsClient.close();
  } catch (e) {
    // noop
  }

  console.log('✅ Servidor encerrado');
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = app;
