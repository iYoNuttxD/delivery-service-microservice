const { getConnection, sql } = require('../config/database');

class AluguelRepository {
  async findAll(filters = {}) {
    const pool = await getConnection();
    let query = `
      SELECT a.*, 
             e.Nome as EntregadorNome,
             v.Placa as VeiculoPlaca,
             v.Modelo as VeiculoModelo
      FROM Aluguel a
      INNER JOIN Entregador e ON a.EntregadorId = e.Id
      INNER JOIN Veiculo v ON a.VeiculoId = v.Id
      WHERE 1=1
    `;
    
    const request = pool.request();
    
    if (filters.entregadorId) {
      query += ' AND a.EntregadorId = @entregadorId';
      request.input('entregadorId', sql.Int, filters.entregadorId);
    }
    
    if (filters.status) {
      query += ' AND a.Status = @status';
      request.input('status', sql.NVarChar, filters.status);
    }
    
    query += ' ORDER BY a.CreatedAt DESC';
    
    const result = await request.query(query);
    return result.recordset;
  }

  async findById(id) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT a.*, 
               e.Nome as EntregadorNome,
               v.Placa as VeiculoPlaca,
               v.Modelo as VeiculoModelo
        FROM Aluguel a
        INNER JOIN Entregador e ON a.EntregadorId = e.Id
        INNER JOIN Veiculo v ON a.VeiculoId = v.Id
        WHERE a.Id = @id
      `);
    
    return result.recordset[0];
  }

  async create(data) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input('dataInicio', sql.Date, data.dataInicio)
      .input('entregadorId', sql.Int, data.entregadorId)
      .input('veiculoId', sql.Int, data.veiculoId)
      .query(`
        INSERT INTO Aluguel (DataInicio, EntregadorId, VeiculoId)
        OUTPUT INSERTED.*
        VALUES (@dataInicio, @entregadorId, @veiculoId)
      `);
    
    return result.recordset[0];
  }

  async finalize(id, dataFim, valor) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('dataFim', sql.Date, dataFim)
      .input('valor', sql.Float, valor)
      .query(`
        UPDATE Aluguel 
        SET DataFim = @dataFim, 
            Valor = @valor, 
            Status = 'FINALIZADO',
            UpdatedAt = GETUTCDATE()
        OUTPUT INSERTED.*
        WHERE Id = @id
      `);
    
    return result.recordset[0];
  }

  async cancel(id) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE Aluguel 
        SET Status = 'CANCELADO',
            UpdatedAt = GETUTCDATE()
        OUTPUT INSERTED.*
        WHERE Id = @id
      `);
    
    return result.recordset[0];
  }
}

module.exports = new AluguelRepository();