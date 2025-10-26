const request = require('supertest');
const app = require('../../src/app');

describe('Entregadores API', () => {
  let createdEntregadorId;

  describe('POST /api/v1/entregadores', () => {
    it('Deve criar um novo entregador', async () => {
      const newEntregador = {
        nome: 'Test User',
        documento: '99999999999',
        cnh: 'CNH999999',
        cnhCategoria: 'AB',
        email: 'test@example.com',
        telefone: '11999999999',
        dataNascimento: '1995-01-01'
      };

      const response = await request(app)
        .post('/api/v1/entregadores')
        .send(newEntregador)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('Id');
      expect(response.body.data.Nome).toBe(newEntregador.nome);

      createdEntregadorId = response.body.data.Id;
    });

    it('Deve retornar erro ao tentar criar entregador com CPF duplicado', async () => {
      const duplicateEntregador = {
        nome: 'Test User 2',
        documento: '99999999999', // Mesmo CPF
        cnh: 'CNH888888',
        cnhCategoria: 'A',
        email: 'test2@example.com',
        telefone: '11888888888',
        dataNascimento: '1992-05-15'
      };

      const response = await request(app)
        .post('/api/v1/entregadores')
        .send(duplicateEntregador)
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/entregadores', () => {
    it('Deve listar todos os entregadores', async () => {
      const response = await request(app)
        .get('/api/v1/entregadores')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.total).toBeGreaterThan(0);
    });

    it('Deve filtrar entregadores por status', async () => {
      const response = await request(app)
        .get('/api/v1/entregadores?status=ATIVO')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(entregador => {
        expect(entregador.Status).toBe('ATIVO');
      });
    });
  });

  describe('GET /api/v1/entregadores/:id', () => {
    it('Deve buscar um entregador por ID', async () => {
      const response = await request(app)
        .get(`/api/v1/entregadores/${createdEntregadorId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.Id).toBe(createdEntregadorId);
    });

    it('Deve retornar 404 para ID inexistente', async () => {
      const response = await request(app)
        .get('/api/v1/entregadores/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/entregadores/:id', () => {
    it('Deve atualizar um entregador', async () => {
      const updateData = {
        telefone: '11777777777'
      };

      const response = await request(app)
        .put(`/api/v1/entregadores/${createdEntregadorId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.Telefone).toBe(updateData.telefone);
    });
  });

  describe('DELETE /api/v1/entregadores/:id', () => {
    it('Deve deletar um entregador', async () => {
      await request(app)
        .delete(`/api/v1/entregadores/${createdEntregadorId}`)
        .expect(204);
    });
  });
});