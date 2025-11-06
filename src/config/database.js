const sql = require('mssql');
const logger = require('../utils/logger');

let pool;

// Permite usar uma connection string única ou variáveis separadas.
const connectionString =
  process.env.AZURE_SQL_CONNECTION_STRING ||
  process.env.SQLSERVER_CONNECTION_STRING ||
  null;

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || process.env.DB_HOST, // aceita DB_SERVER (preferido) ou DB_HOST
  database: process.env.DB_NAME || process.env.DB_DATABASE, // aceita DB_NAME (preferido) ou DB_DATABASE
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT ? process.env.DB_ENCRYPT === 'true' : true,
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
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
    await pool.connect();
    return pool;
  }

  pool = connectionString
    ? new sql.ConnectionPool(connectionString)
    : new sql.ConnectionPool(config);

  try {
    await pool.connect();
    return pool;
  } catch (err) {
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
