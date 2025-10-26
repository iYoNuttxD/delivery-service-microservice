const { getConnection, sql } = require('../config/database');

class VeiculoRepository {
  async findAll(filters = {}) {
    const pool = await getConnection();
    let query = 'SELECT * FROM Veiculo WHERE 1=1';
    const request = pool.request();
    
    if (filters.status) {
      query += ' AND Status = @status';
      request.input('status', sql.NVarChar, filters.status);
    }
    
    if (filters.tipo) {
      query += ' AND Tipo = @tipo';
      request.input('tipo', sql.NVarChar, filters.tipo);
    }
    
    query += ' ORDER BY CreatedAt DESC';
    
    const result = await request.query(query);
    return result.recordset;
  }

  async findById(id) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Veiculo WHERE Id = @id');
    
    return result.recordset[0];
  }

  async findByPlaca(placa) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input('placa', sql.NVarChar, placa)
      .query('SELECT * FROM Veiculo WHERE Placa = @placa');
    
    return result.recordset[0];
  }

  async create(data) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input('tipo', sql.NVarChar, data.tipo)
      .input('placa', sql.NVarChar, data.placa)
      .input('modelo', sql.NVarChar, data.modelo)
      .input('marca', sql.NVarChar, data.marca)
      .input('ano', sql.Int, data.ano)
      .input('precoDiaria', sql.Float, data.precoDiaria)
      .input('locadorId', sql.Int, data.locadorId)
      .query(`
        INSERT INTO Veiculo (Tipo, Placa, Modelo, Marca, Ano, PrecoDiaria, LocadorId)
        OUTPUT INSERTED.*
        VALUES (@tipo, @placa, @modelo, @marca, @ano, @precoDiaria, @locadorId)
      `);
    
    return result.recordset[0];
  }

  async update(id, data) {
    const pool = await getConnection();
    
    const updates = [];
    const request = pool.request().input('id', sql.Int, id);
    
    if (data.status) {
      updates.push('Status = @status');
      request.input('status', sql.NVarChar, data.status);
    }
    if (data.precoDiaria !== undefined) {
      updates.push('PrecoDiaria = @precoDiaria');
      request.input('precoDiaria', sql.Float, data.precoDiaria);
    }
    
    updates.push('UpdatedAt = GETUTCDATE()');
    
    const result = await request.query(`
      UPDATE Veiculo 
      SET ${updates.join(', ')}
      OUTPUT INSERTED.*
      WHERE Id = @id
    `);
    
    return result.recordset[0];
  }

  async delete(id) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Veiculo WHERE Id = @id');
    
    return result.rowsAffected[0] > 0;
  }
}

module.exports = new VeiculoRepository();