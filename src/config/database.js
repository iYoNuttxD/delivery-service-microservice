const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,      // Nome do banco de dados
  process.env.DB_USER,      // Usuário
  process.env.DB_PASSWORD,  // Senha
  {
    host: process.env.DB_HOST, // Endereço do servidor
    dialect: 'mssql',          // Ou o dialeto que você usa
    dialectOptions: {
      options: {
        encrypt: true, // Essencial para Azure SQL
      }
    }
  }
);

module.exports = sequelize;
