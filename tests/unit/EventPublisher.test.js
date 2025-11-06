const EventPublisher = require('../../src/messaging/EventPublisher');
const natsClient = require('../../src/messaging/natsClient');

// Mock natsClient
jest.mock('../../src/messaging/natsClient');

describe('EventPublisher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('publishDeliveryStatusChange', () => {
    it('Deve publicar evento de mudança de status com sucesso', async () => {
      natsClient.publish.mockResolvedValue(true);

      const result = await EventPublisher.publishDeliveryStatusChange(1, 'ENTREGUE', {
        entregadorId: 10
      });

      expect(result).toBe(true);
      expect(natsClient.publish).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          deliveryId: 1,
          status: 'ENTREGUE',
          entregadorId: 10,
          timestamp: expect.any(String)
        })
      );
    });

    it('Deve retornar false quando NATS falha', async () => {
      natsClient.publish.mockResolvedValue(false);

      const result = await EventPublisher.publishDeliveryStatusChange(1, 'ENTREGUE');

      expect(result).toBe(false);
    });
  });

  describe('publishDeliveryCreated', () => {
    it('Deve publicar evento de entrega criada', async () => {
      natsClient.publish.mockResolvedValue(true);

      const delivery = {
        Id: 1,
        PedidoId: 'ORDER-123',
        EntregadorId: 10,
        Status: 'PENDENTE'
      };

      const result = await EventPublisher.publishDeliveryCreated(delivery);

      expect(result).toBe(true);
      expect(natsClient.publish).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          deliveryId: 1,
          pedidoId: 'ORDER-123',
          entregadorId: 10,
          status: 'PENDENTE'
        })
      );
    });
  });

  describe('publishDeliveryCompleted', () => {
    it('Deve publicar evento de entrega concluída', async () => {
      natsClient.publish.mockResolvedValue(true);

      const delivery = {
        Id: 1,
        PedidoId: 'ORDER-123',
        EntregadorId: 10,
        HoraEntrega: new Date()
      };

      const result = await EventPublisher.publishDeliveryCompleted(delivery);

      expect(result).toBe(true);
      expect(natsClient.publish).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          deliveryId: 1,
          pedidoId: 'ORDER-123',
          entregadorId: 10
        })
      );
    });
  });
});
