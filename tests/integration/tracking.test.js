const request = require('supertest');
const app = require('../../src/app');

describe('Tracking Routes Integration Tests', () => {
  describe('POST /api/v1/tracking/:deliveryId', () => {
    it('should update tracking position successfully', async () => {
      const deliveryId = 'test-delivery-123';
      const position = {
        lat: -23.5505,
        lng: -46.6333
      };

      const response = await request(app)
        .post(`/api/v1/tracking/${deliveryId}`)
        .send(position)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('deliveryId', deliveryId);
      expect(response.body.data).toHaveProperty('lat', position.lat);
      expect(response.body.data).toHaveProperty('lng', position.lng);
      expect(response.body.data).toHaveProperty('updatedAt');
    });

    it('should return 400 when lat/lng are missing', async () => {
      const response = await request(app)
        .post('/api/v1/tracking/test-delivery')
        .send({})
        .expect(400);

      expect(response.body.message).toContain('obrigatórios');
    });

    it('should return 400 when coordinates are invalid', async () => {
      const response = await request(app)
        .post('/api/v1/tracking/test-delivery')
        .send({ lat: 'invalid', lng: 'invalid' })
        .expect(400);

      expect(response.body.message).toContain('números');
    });

    it('should return 400 when coordinates are out of bounds', async () => {
      const response = await request(app)
        .post('/api/v1/tracking/test-delivery')
        .send({ lat: 91, lng: 181 })
        .expect(400);

      expect(response.body.message).toContain('limites');
    });
  });

  describe('GET /api/v1/tracking/:deliveryId', () => {
    it('should get tracking position after update', async () => {
      const deliveryId = 'test-delivery-456';
      const position = {
        lat: -22.9068,
        lng: -43.1729
      };

      // First, create a position
      await request(app)
        .post(`/api/v1/tracking/${deliveryId}`)
        .send(position);

      // Then retrieve it
      const response = await request(app)
        .get(`/api/v1/tracking/${deliveryId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('deliveryId', deliveryId);
      expect(response.body.data).toHaveProperty('lat', position.lat);
      expect(response.body.data).toHaveProperty('lng', position.lng);
    });

    it('should return 404 when position does not exist', async () => {
      const response = await request(app)
        .get('/api/v1/tracking/nonexistent-delivery')
        .expect(404);

      expect(response.body.message).toContain('não encontrada');
    });
  });
});
