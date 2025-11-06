const axios = require('axios');

// Mock axios
jest.mock('axios');

describe('MapServiceAdapter - Disabled Mode Tests', () => {
  let MapServiceAdapter;

  beforeAll(() => {
    // Ensure MAP_SERVICE_URL is not set
    delete process.env.MAP_SERVICE_URL;
    jest.resetModules();
    MapServiceAdapter = require('../../src/infra/adapters/MapServiceAdapter');
  });

  describe('When service is disabled (no MAP_SERVICE_URL)', () => {
    it('should return mock route when calculateRoute is called', async () => {
      const origin = 'Rua A, 123';
      const destination = 'Rua B, 456';

      const result = await MapServiceAdapter.calculateRoute(origin, destination);

      expect(result).toHaveProperty('distance');
      expect(result).toHaveProperty('duration');
      expect(result.distance).toBe(5000); // Mock returns 5km
      expect(result.duration).toBe(900); // Mock returns 15 min
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should return mock coordinates when geocodeAddress is called', async () => {
      const address = 'Av. Paulista, 1000';

      const result = await MapServiceAdapter.geocodeAddress(address);

      expect(result).toHaveProperty('latitude');
      expect(result).toHaveProperty('longitude');
      expect(result.latitude).toBe(-23.5505); // Mock São Paulo coords
      expect(result.longitude).toBe(-46.6333);
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('should return mock address for reverseGeocode', async () => {
      const result = await MapServiceAdapter.reverseGeocode(-23.5505, -46.6333);

      expect(result).toHaveProperty('address');
      expect(result.address).toContain('Lat:');
      expect(result.address).toContain('Lng:');
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('should calculate mock ETA', async () => {
      const origin = 'Rua A';
      const destination = 'Rua B';

      const result = await MapServiceAdapter.calculateETA(origin, destination);

      expect(result).toHaveProperty('eta');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('distance');
      expect(result.eta).toBeInstanceOf(Date);
    });

    it('isEnabled should return false', () => {
      expect(MapServiceAdapter.isEnabled()).toBe(false);
    });

    it('getStatus should show disabled', () => {
      const status = MapServiceAdapter.getStatus();

      expect(status.enabled).toBe(false);
      expect(status.url).toBeNull();
    });
  });

  describe('Fallback behavior', () => {
    it('should handle null/undefined gracefully', async () => {
      const result = await MapServiceAdapter.calculateRoute(null, null);

      // Should still return mock data
      expect(result.distance).toBe(5000);
      expect(result.duration).toBe(900);
    });

    it('getMockRoute should return consistent structure', () => {
      const mockRoute = MapServiceAdapter.getMockRoute('origin', 'destination');

      expect(mockRoute).toHaveProperty('distance');
      expect(mockRoute).toHaveProperty('duration');
      expect(mockRoute).toHaveProperty('polyline');
      expect(mockRoute).toHaveProperty('steps');
      expect(Array.isArray(mockRoute.steps)).toBe(true);
    });

    it('getMockCoordinates should return São Paulo default', () => {
      const mockCoords = MapServiceAdapter.getMockCoordinates('any address');

      expect(mockCoords.latitude).toBe(-23.5505);
      expect(mockCoords.longitude).toBe(-46.6333);
      expect(mockCoords.formattedAddress).toBe('any address');
    });
  });
});
