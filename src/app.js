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

const app = express();
const PORT = process.env.PORT || 3001;

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

// Iniciar servidor
const server = app.listen(PORT, async () => {
  console.log(`🚀 Delivery Service rodando na porta ${PORT}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  
  try {
    await getConnection();
    logger.info('✅ Banco de dados conectado');
  } catch (error) {
    logger.error('❌ Erro ao conectar ao banco:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM recebido, fechando servidor...');
  server.close(async () => {
    await closeConnection();
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});

module.exports = app;