const { getConnection, sql, closeConnection } = require('./src/config/database');

async function testConnection() {
  try {
    console.log('🔄 Testando conexão com Azure SQL Server...\n');
    
    const pool = await getConnection();
    
    // Testar query simples
    const result = await pool.request()
      .query('SELECT GETDATE() AS CurrentTime, DB_NAME() AS DatabaseName');
    
    console.log('✅ Conexão bem-sucedida!');
    console.log('📊 Dados do banco:', result.recordset[0]);
    
    // Testar se as tabelas existem
    const tables = await pool.request()
      .query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_NAME
      `);
    
    console.log('\n📋 Tabelas criadas:');
    tables.recordset.forEach(table => {
      console.log(`   ✓ ${table.TABLE_NAME}`);
    });
    
    // Contar registros
    const counts = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM Entregador) as Entregadores,
        (SELECT COUNT(*) FROM Veiculo) as Veiculos,
        (SELECT COUNT(*) FROM Aluguel) as Alugueis,
        (SELECT COUNT(*) FROM Entrega) as Entregas
    `);
    
    console.log('\n📊 Registros no banco:');
    const data = counts.recordset[0];
    console.log(`   • Entregadores: ${data.Entregadores}`);
    console.log(`   • Veículos: ${data.Veiculos}`);
    console.log(`   • Aluguéis: ${data.Alugueis}`);
    console.log(`   • Entregas: ${data.Entregas}`);
    
    await closeConnection();
    console.log('\n✅ Teste concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro na conexão:', error.message);
    process.exit(1);
  }
}

testConnection();