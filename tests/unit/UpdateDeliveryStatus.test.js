const UpdateDeliveryStatus = require('../../src/use-cases/deliveries/UpdateDeliveryStatus');
const Entrega = require('../../src/domain/entities/Entrega');

describe('UpdateDeliveryStatus Use Case', () => {
  let mockDeliveryRepository;
  let mockMessageBus;
  let mockLogger;
  let mockMetrics;
  let updateDeliveryStatus;

  beforeEach(() => {
    mockDeliveryRepository = {
      findById: jest.fn(),
      updateStatus: jest.fn()
    };

    mockMessageBus = {
      publish: jest.fn().mockResolvedValue(true)
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn()
    };

    mockMetrics = {
      recordDeliveryStatusChange: jest.fn()
    };

    updateDeliveryStatus = new UpdateDeliveryStatus(
      mockDeliveryRepository,
      mockMessageBus,
      mockLogger,
      mockMetrics
    );
  });

  describe('Status transitions', () => {
    it('should update delivery status from PENDENTE to ATRIBUIDA', async () => {
      const mockDelivery = {
        Id: 1,
        PedidoId: 'PED-001',
        EntregadorId: 10,
        AluguelId: 5,
        EnderecoColeta: 'Rua A, 123',
        EnderecoEntrega: 'Rua B, 456',
        TaxaEntrega: 10.50,
        Status: 'PENDENTE',
        HoraColeta: null,
        HoraEntrega: null,
        CreatedAt: new Date('2024-01-01'),
        UpdatedAt: new Date('2024-01-01')
      };

      const updatedDelivery = { ...mockDelivery, Status: 'ATRIBUIDA' };

      mockDeliveryRepository.findById.mockResolvedValue(mockDelivery);
      mockDeliveryRepository.updateStatus.mockResolvedValue(updatedDelivery);

      const result = await updateDeliveryStatus.execute(1, 'ATRIBUIDA');

      expect(result.status).toBe('ATRIBUIDA');
      expect(mockDeliveryRepository.updateStatus).toHaveBeenCalledWith(
        1,
        'ATRIBUIDA',
        expect.any(Object)
      );
      expect(mockMessageBus.publish).toHaveBeenCalledWith(
        'delivery.status.changed',
        expect.objectContaining({
          deliveryId: 1,
          oldStatus: 'PENDENTE',
          status: 'ATRIBUIDA'
        })
      );
    });

    it('should publish DeliveryCompleted event when status is ENTREGUE', async () => {
      const mockDelivery = {
        Id: 1,
        PedidoId: 'PED-001',
        EntregadorId: 10,
        AluguelId: 5,
        EnderecoColeta: 'Rua A, 123',
        EnderecoEntrega: 'Rua B, 456',
        TaxaEntrega: 10.50,
        Status: 'EM_TRANSITO',
        HoraColeta: new Date('2024-01-01T10:00:00'),
        HoraEntrega: null,
        CreatedAt: new Date('2024-01-01'),
        UpdatedAt: new Date('2024-01-01')
      };

      const now = new Date();
      const updatedDelivery = {
        ...mockDelivery,
        Status: 'ENTREGUE',
        HoraEntrega: now
      };

      mockDeliveryRepository.findById.mockResolvedValue(mockDelivery);
      mockDeliveryRepository.updateStatus.mockResolvedValue(updatedDelivery);

      const result = await updateDeliveryStatus.execute(1, 'ENTREGUE');

      expect(result.status).toBe('ENTREGUE');
      expect(result.horaEntrega).toBeTruthy();

      // Should publish both status changed and completed events
      expect(mockMessageBus.publish).toHaveBeenCalledTimes(2);
      expect(mockMessageBus.publish).toHaveBeenCalledWith(
        'delivery.status.changed',
        expect.any(Object)
      );
      expect(mockMessageBus.publish).toHaveBeenCalledWith(
        'delivery.completed',
        expect.objectContaining({
          deliveryId: 1
        })
      );
    });

    it('should throw error for invalid status transition', async () => {
      const mockDelivery = {
        Id: 1,
        PedidoId: 'PED-001',
        EntregadorId: 10,
        AluguelId: 5,
        EnderecoColeta: 'Rua A, 123',
        EnderecoEntrega: 'Rua B, 456',
        TaxaEntrega: 10.50,
        Status: 'PENDENTE',
        HoraColeta: null,
        HoraEntrega: null,
        CreatedAt: new Date('2024-01-01'),
        UpdatedAt: new Date('2024-01-01')
      };

      mockDeliveryRepository.findById.mockResolvedValue(mockDelivery);

      await expect(
        updateDeliveryStatus.execute(1, 'ENTREGUE')
      ).rejects.toThrow('Transição inválida');

      expect(mockDeliveryRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should record metrics when status changes', async () => {
      const mockDelivery = {
        Id: 1,
        PedidoId: 'PED-001',
        EntregadorId: 10,
        AluguelId: 5,
        EnderecoColeta: 'Rua A, 123',
        EnderecoEntrega: 'Rua B, 456',
        TaxaEntrega: 10.50,
        Status: 'COLETADA',
        HoraColeta: new Date(),
        HoraEntrega: null,
        CreatedAt: new Date('2024-01-01'),
        UpdatedAt: new Date('2024-01-01')
      };

      const updatedDelivery = { ...mockDelivery, Status: 'EM_TRANSITO' };

      mockDeliveryRepository.findById.mockResolvedValue(mockDelivery);
      mockDeliveryRepository.updateStatus.mockResolvedValue(updatedDelivery);

      await updateDeliveryStatus.execute(1, 'EM_TRANSITO');

      expect(mockMetrics.recordDeliveryStatusChange).toHaveBeenCalledWith(
        'COLETADA',
        'EM_TRANSITO'
      );
    });

    it('should throw 404 error when delivery not found', async () => {
      mockDeliveryRepository.findById.mockResolvedValue(null);

      await expect(
        updateDeliveryStatus.execute(999, 'ATRIBUIDA')
      ).rejects.toThrow('Entrega não encontrada');
    });
  });
});
