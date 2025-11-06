const MapIntegrationAdapter = require('../../src/adapters/MapIntegrationAdapter');

describe('MapIntegrationAdapter', () => {
  describe('quando o serviço está desabilitado', () => {
    beforeAll(() => {
      // Ensure MAP_SERVICE_URL is not set
      delete process.env.MAP_SERVICE_URL;
    });

    it('Deve retornar rota mock quando serviço está desabilitado', async () => {
      const result = await MapIntegrationAdapter.calculateRoute(
        'Rua A, 123',
        'Rua B, 456'
      );

      expect(result).toHaveProperty('distance');
      expect(result).toHaveProperty('duration');
      expect(result.distance).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThan(0);
    });

    it('Deve retornar coordenadas mock quando serviço está desabilitado', async () => {
      const result = await MapIntegrationAdapter.geocodeAddress('Rua A, 123');

      expect(result).toHaveProperty('latitude');
      expect(result).toHaveProperty('longitude');
      expect(result).toHaveProperty('formattedAddress');
      expect(typeof result.latitude).toBe('number');
      expect(typeof result.longitude).toBe('number');
    });

    it('Deve retornar endereço mock na geocodificação reversa', async () => {
      const result = await MapIntegrationAdapter.reverseGeocode(-23.5505, -46.6333);

      expect(result).toHaveProperty('address');
      expect(result.address).toContain('Lat:');
      expect(result.address).toContain('Lng:');
    });

    it('Deve calcular ETA mock', async () => {
      const result = await MapIntegrationAdapter.calculateETA(
        'Rua A, 123',
        'Rua B, 456'
      );

      expect(result).toHaveProperty('eta');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('distance');
      expect(result.eta).toBeInstanceOf(Date);
    });

    it('isEnabled deve retornar false', () => {
      expect(MapIntegrationAdapter.isEnabled()).toBe(false);
    });

    it('getStatus deve retornar informações corretas', () => {
      const status = MapIntegrationAdapter.getStatus();
      
      expect(status).toHaveProperty('enabled', false);
      expect(status).toHaveProperty('provider');
      expect(status).toHaveProperty('url', null);
    });
  });
});
