const TrackingService = require('../../src/services/TrackingService');

describe('TrackingService', () => {
  beforeEach(() => {
    // Clear the in-memory tracking data before each test
    TrackingService.trackingData = new Map();
  });

  describe('updatePosition', () => {
    it('should update position successfully', async () => {
      const deliveryId = '123';
      const lat = -23.5505;
      const lng = -46.6333;

      const result = await TrackingService.updatePosition(deliveryId, lat, lng);

      expect(result).toHaveProperty('lat', lat);
      expect(result).toHaveProperty('lng', lng);
      expect(result).toHaveProperty('updatedAt');
    });

    it('should store position in memory', async () => {
      const deliveryId = '456';
      const lat = -22.9068;
      const lng = -43.1729;

      await TrackingService.updatePosition(deliveryId, lat, lng);
      const position = await TrackingService.getPosition(deliveryId);

      expect(position.lat).toBe(lat);
      expect(position.lng).toBe(lng);
    });
  });

  describe('getPosition', () => {
    it('should return position when it exists', async () => {
      const deliveryId = '789';
      const lat = -15.7942;
      const lng = -47.8822;

      await TrackingService.updatePosition(deliveryId, lat, lng);
      const result = await TrackingService.getPosition(deliveryId);

      expect(result).toHaveProperty('lat', lat);
      expect(result).toHaveProperty('lng', lng);
    });

    it('should throw error when position does not exist', async () => {
      await expect(
        TrackingService.getPosition('nonexistent')
      ).rejects.toThrow('Posição de rastreamento não encontrada');
    });
  });

  describe('deletePosition', () => {
    it('should delete position successfully', async () => {
      const deliveryId = 'delete-test';
      await TrackingService.updatePosition(deliveryId, 10.0, 20.0);

      await TrackingService.deletePosition(deliveryId);

      await expect(
        TrackingService.getPosition(deliveryId)
      ).rejects.toThrow();
    });
  });

  describe('getAllPositions', () => {
    it('should return all positions', async () => {
      await TrackingService.updatePosition('id1', 10.0, 20.0);
      await TrackingService.updatePosition('id2', 30.0, 40.0);

      const positions = await TrackingService.getAllPositions();

      expect(positions).toHaveProperty('id1');
      expect(positions).toHaveProperty('id2');
      expect(positions.id1.lat).toBe(10.0);
      expect(positions.id2.lat).toBe(30.0);
    });

    it('should return empty object when no positions exist', async () => {
      const positions = await TrackingService.getAllPositions();
      expect(positions).toEqual({});
    });
  });
});
