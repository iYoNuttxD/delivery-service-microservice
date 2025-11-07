const UpdateDeliveryTrackingPosition = require('../../src/features/tracking/use-cases/UpdateDeliveryTrackingPosition');

describe('UpdateDeliveryTrackingPosition Use Case', () => {
  let mockDeliveryRepository;
  let mockLogger;
  let updateTrackingPosition;

  beforeEach(() => {
    mockDeliveryRepository = {
      findById: jest.fn()
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn()
    };

    updateTrackingPosition = new UpdateDeliveryTrackingPosition(
      mockDeliveryRepository,
      mockLogger
    );
  });

  describe('Position updates', () => {
    it('should update delivery tracking position successfully', async () => {
      const mockDelivery = {
        Id: 1,
        PedidoId: 'PED-001',
        EntregadorId: 10,
        Status: 'EM_TRANSITO'
      };

      mockDeliveryRepository.findById.mockResolvedValue(mockDelivery);

      const position = { lat: -23.5505, lng: -46.6333 };
      const result = await updateTrackingPosition.execute(1, position);

      expect(result.deliveryId).toBe(1);
      expect(result.position.lat).toBe(-23.5505);
      expect(result.position.lng).toBe(-46.6333);
      expect(result.position.timestamp).toBeInstanceOf(Date);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Updating delivery tracking position',
        { deliveryId: 1, position }
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Delivery position updated',
        expect.objectContaining({ deliveryId: 1 })
      );
    });

    it('should throw 404 error when delivery not found', async () => {
      mockDeliveryRepository.findById.mockResolvedValue(null);

      await expect(
        updateTrackingPosition.execute(999, { lat: -23.5505, lng: -46.6333 })
      ).rejects.toThrow('Entrega não encontrada');

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should accept different coordinate formats', async () => {
      const mockDelivery = {
        Id: 2,
        PedidoId: 'PED-002',
        EntregadorId: 11,
        Status: 'COLETADA'
      };

      mockDeliveryRepository.findById.mockResolvedValue(mockDelivery);

      const position = { lat: 40.7128, lng: -74.0060 }; // New York
      const result = await updateTrackingPosition.execute(2, position);

      expect(result.position.lat).toBe(40.7128);
      expect(result.position.lng).toBe(-74.0060);
    });
  });
});
