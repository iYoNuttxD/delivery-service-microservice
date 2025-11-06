const TrackingService = require('../../src/services/TrackingService');
const EntregaRepository = require('../../src/repositories/EntregaRepository');

// Mock the repository
jest.mock('../../src/repositories/EntregaRepository');

describe('TrackingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDeliveryTracking', () => {
    it('Deve retornar rastreamento de uma entrega', async () => {
      const mockDelivery = {
        Id: 1,
        PedidoId: 'ORDER-123',
        Status: 'EM_TRANSITO',
        EntregadorId: 10,
        EntregadorNome: 'João Silva',
        CreatedAt: new Date('2023-01-01'),
        UpdatedAt: new Date('2023-01-01'),
        HoraColeta: new Date('2023-01-01T10:00:00')
      };

      EntregaRepository.findById.mockResolvedValue(mockDelivery);

      const result = await TrackingService.getDeliveryTracking(1);

      expect(result).toHaveProperty('deliveryId', 1);
      expect(result).toHaveProperty('status', 'EM_TRANSITO');
      expect(result).toHaveProperty('timeline');
      expect(result.timeline).toBeInstanceOf(Array);
      expect(result.timeline.length).toBeGreaterThan(0);
      expect(EntregaRepository.findById).toHaveBeenCalledWith(1);
    });

    it('Deve lançar erro quando entrega não existe', async () => {
      EntregaRepository.findById.mockResolvedValue(null);

      await expect(TrackingService.getDeliveryTracking(999))
        .rejects
        .toThrow('Entrega não encontrada');
    });
  });

  describe('getDeliveriesByStatus', () => {
    it('Deve retornar entregas por status', async () => {
      const mockDeliveries = [
        {
          Id: 1,
          PedidoId: 'ORDER-123',
          Status: 'PENDENTE',
          EntregadorId: 10,
          EntregadorNome: 'João Silva',
          CreatedAt: new Date()
        },
        {
          Id: 2,
          PedidoId: 'ORDER-124',
          Status: 'PENDENTE',
          EntregadorId: 11,
          EntregadorNome: 'Maria Santos',
          CreatedAt: new Date()
        }
      ];

      EntregaRepository.findAll.mockResolvedValue(mockDeliveries);

      const result = await TrackingService.getDeliveriesByStatus('PENDENTE');

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('deliveryId', 1);
      expect(result[1]).toHaveProperty('deliveryId', 2);
      expect(EntregaRepository.findAll).toHaveBeenCalledWith({ status: 'PENDENTE' });
    });
  });

  describe('getDriverActiveDeliveries', () => {
    it('Deve retornar entregas ativas de um entregador', async () => {
      const mockDeliveries = [
        {
          Id: 1,
          PedidoId: 'ORDER-123',
          Status: 'ATRIBUIDA',
          EntregadorId: 10,
          EnderecoColeta: 'Rua A',
          EnderecoEntrega: 'Rua B'
        },
        {
          Id: 2,
          PedidoId: 'ORDER-124',
          Status: 'EM_TRANSITO',
          EntregadorId: 10,
          EnderecoColeta: 'Rua C',
          EnderecoEntrega: 'Rua D'
        },
        {
          Id: 3,
          PedidoId: 'ORDER-125',
          Status: 'ENTREGUE',
          EntregadorId: 10,
          EnderecoColeta: 'Rua E',
          EnderecoEntrega: 'Rua F'
        }
      ];

      EntregaRepository.findAll.mockResolvedValue(mockDeliveries);

      const result = await TrackingService.getDriverActiveDeliveries(10);

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(2); // Only ATRIBUIDA and EM_TRANSITO
      expect(result[0].status).toBe('ATRIBUIDA');
      expect(result[1].status).toBe('EM_TRANSITO');
      expect(EntregaRepository.findAll).toHaveBeenCalledWith({ entregadorId: 10 });
    });
  });
});
