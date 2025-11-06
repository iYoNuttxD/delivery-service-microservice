const request = require('supertest');
const app = require('../../src/app');

describe('Health and Integration Endpoints', () => {
  describe('GET /api/v1/health', () => {
    it('Deve retornar status UP do serviço', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'UP');
      expect(response.body).toHaveProperty('service', 'Delivery Service');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('integrations');
    });

    it('Deve incluir status das integrações', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body.integrations).toHaveProperty('nats');
      expect(response.body.integrations).toHaveProperty('opa');
      expect(response.body.integrations).toHaveProperty('map');
    });
  });

  describe('GET /api/v1/metrics', () => {
    it('Deve retornar métricas Prometheus', async () => {
      const response = await request(app)
        .get('/api/v1/metrics')
        .expect(200);

      expect(response.text).toContain('delivery_service_');
      expect(response.headers['content-type']).toMatch(/text\/plain/);
    });
  });

  describe('Tracking Endpoints', () => {
    it('GET /api/v1/tracking/deliveries deve retornar 400 sem status', async () => {
      const response = await request(app)
        .get('/api/v1/tracking/deliveries')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Status');
    });
  });
});
