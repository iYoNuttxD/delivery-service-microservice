const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true, // Obrigatório para Azure
    trustServerCertificate: false,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let poolPromise;

const getConnection = async () => {
  try {
    if (!poolPromise) {
      poolPromise = await sql.connect(config);
      console.log('✅ Conectado ao Azure SQL Server');
    }
    return poolPromise;
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco:', error);
    throw error;
  }
};

const closeConnection = async () => {
  try {
    if (poolPromise) {
      await (await poolPromise).close();
      poolPromise = null;
      console.log('✅ Conexão com banco fechada');
    }
  } catch (error) {
    console.error('❌ Erro ao fechar conexão:', error);
  }
};

module.exports = {
  sql,
  getConnection,
  closeConnection,
};