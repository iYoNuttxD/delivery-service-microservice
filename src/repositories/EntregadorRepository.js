const { getConnection, sql } = require('../config/database');

class EntregaRepository {
  async findAll(filters = {}) {
    const pool = await getConnection();
    let query = `
      SELECT e.*, 
             ent.Nome as EntregadorNome,
             a.VeiculoId
      FROM Entrega e
      INNER JOIN Entregador ent ON e.EntregadorId = ent.Id
      INNER JOIN Aluguel a ON e.AluguelId = a.Id
      WHERE 1=1
    `;
    
    const request = pool.request();
    
    if (filters.entregadorId) {
      query += ' AND e.EntregadorId = @entregadorId';
      request.input('entregadorId', sql.Int, filters.entregadorId);
    }
    
    if (filters.status) {
      query += ' AND e.Status = @status';
      request.input('status', sql.NVarChar, filters.status);
    }
    
    if (filters.pedidoId) {
      query += ' AND e.PedidoId = @pedidoId';
      request.input('pedidoId', sql.NVarChar, filters.pedidoId);
    }
    
    query += ' ORDER BY e.CreatedAt DESC';
    
    const result = await request.query(query);
    return result.recordset;
  }

  async findById(id) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT e.*, 
               ent.Nome as EntregadorNome,
               a.VeiculoId
        FROM Entrega e
        INNER JOIN Entregador ent ON e.EntregadorId = ent.Id
        INNER JOIN Aluguel a ON e.AluguelId = a.Id
        WHERE e.Id = @id
      `);
    
    return result.recordset[0];
  }

  async create(data) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input('pedidoId', sql.NVarChar, data.pedidoId)
      .input('entregadorId', sql.Int, data.entregadorId)
      .input('aluguelId', sql.Int, data.aluguelId)
      .input('enderecoColeta', sql.NVarChar, data.enderecoColeta)
      .input('enderecoEntrega', sql.NVarChar, data.enderecoEntrega)
      .input('taxaEntrega', sql.Float, data.taxaEntrega)
      .query(`
        INSERT INTO Entrega (PedidoId, EntregadorId, AluguelId, EnderecoColeta, EnderecoEntrega, TaxaEntrega)
        OUTPUT INSERTED.*
        VALUES (@pedidoId, @entregadorId, @aluguelId, @enderecoColeta, @enderecoEntrega, @taxaEntrega)
      `);
    
    return result.recordset[0];
  }

  async updateStatus(id, status, additionalData = {}) {
    const pool = await getConnection();
    const request = pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar, status);
    
    let updates = ['Status = @status', 'UpdatedAt = GETUTCDATE()'];
    
    if (status === 'COLETADA' && additionalData.horaColeta) {
      updates.push('HoraColeta = @horaColeta');
      request.input('horaColeta', sql.DateTime2, additionalData.horaColeta);
    }
    
    if (status === 'ENTREGUE' && additionalData.horaEntrega) {
      updates.push('HoraEntrega = @horaEntrega');
      request.input('horaEntrega', sql.DateTime2, additionalData.horaEntrega);
    }
    
    const result = await request.query(`
      UPDATE Entrega 
      SET ${updates.join(', ')}
      OUTPUT INSERTED.*
      WHERE Id = @id
    `);
    
    return result.recordset[0];
  }
}

module.exports = new EntregaRepository();