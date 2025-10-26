const { getConnection, sql } = require('../config/database');

class EntregadorRepository {
  async findAll(status = null) {
    const pool = await getConnection();
    let query = 'SELECT * FROM Entregador';
    
    if (status) {
      query += ' WHERE Status = @status';
    }
    
    query += ' ORDER BY CreatedAt DESC';
    
    const request = pool.request();
    if (status) {
      request.input('status', sql.NVarChar, status);
    }
    
    const result = await request.query(query);
    return result.recordset;
  }

  async findById(id) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Entregador WHERE Id = @id');
    
    return result.recordset[0];
  }

  async findByDocumento(documento) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input('documento', sql.NVarChar, documento)
      .query('SELECT * FROM Entregador WHERE Documento = @documento');
    
    return result.recordset[0];
  }

  async create(data) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input('nome', sql.NVarChar, data.nome)
      .input('documento', sql.NVarChar, data.documento)
      .input('cnh', sql.NVarChar, data.cnh)
      .input('cnhCategoria', sql.NVarChar, data.cnhCategoria)
      .input('email', sql.NVarChar, data.email)
      .input('telefone', sql.NVarChar, data.telefone)
      .input('dataNascimento', sql.Date, data.dataNascimento)
      .query(`
        INSERT INTO Entregador (Nome, Documento, CNH, CNHCategoria, Email, Telefone, DataNascimento)
        OUTPUT INSERTED.*
        VALUES (@nome, @documento, @cnh, @cnhCategoria, @email, @telefone, @dataNascimento)
      `);
    
    return result.recordset[0];
  }

  async update(id, data) {
    const pool = await getConnection();
    
    const updates = [];
    const request = pool.request().input('id', sql.Int, id);
    
    if (data.nome) {
      updates.push('Nome = @nome');
      request.input('nome', sql.NVarChar, data.nome);
    }
    if (data.email) {
      updates.push('Email = @email');
      request.input('email', sql.NVarChar, data.email);
    }
    if (data.telefone) {
      updates.push('Telefone = @telefone');
      request.input('telefone', sql.NVarChar, data.telefone);
    }
    if (data.status) {
      updates.push('Status = @status');
      request.input('status', sql.NVarChar, data.status);
    }
    
    updates.push('UpdatedAt = GETUTCDATE()');
    
    const result = await request.query(`
      UPDATE Entregador 
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
      .query('DELETE FROM Entregador WHERE Id = @id');
    
    return result.rowsAffected[0] > 0;
  }
}

module.exports = new EntregadorRepository();
