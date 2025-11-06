const sql = require('mssql');
const logger = require('../utils/logger');

let pool;

/**
 * Configuração do Azure SQL
 * Garanta que as variáveis estejam definidas no ambiente (Azure/App Service/Container/CI).
 */
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST, // ex.: your-server.database.windows.net
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT ? process.env.DB_ENCRYPT === 'true' : true, // Azure SQL requer encrypt
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true', // geralmente false no Azure
  },
  pool: {
    max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX, 10) : 10,
    min: process.env.DB_POOL_MIN ? parseInt(process.env.DB_POOL_MIN, 10) : 0,
    idleTimeoutMillis: process.env.DB_POOL_IDLE ? parseInt(process.env.DB_POOL_IDLE, 10) : 30000,
  },
};

async function getConnection() {
  if (pool && pool.connected) return pool;
  if (pool && pool.connecting) {
    await pool.connect(); // aguarda a conexão em andamento
    return pool;
  }

  pool = new sql.ConnectionPool(config);
  try {
    await pool.connect();
    return pool;
  } catch (err) {
    // Evita ficar com pool em estado inválido
    pool = undefined;
    logger.error('Erro ao conectar ao Azure SQL', { error: err.message });
    throw err;
  }
}

async function closeConnection() {
  if (pool) {
    try {
      await pool.close();
    } finally {
      pool = undefined;
    }
  }
}

module.exports = { getConnection, closeConnection, sql };
