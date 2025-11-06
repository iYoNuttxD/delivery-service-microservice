const eventPublisher = require('../../src/infra/nats/eventPublisher');
const natsClient = require('../../src/infra/nats/natsClient');

// Mock the natsClient
jest.mock('../../src/infra/nats/natsClient', () => ({
  getConnection: jest.fn(),
  getCodec: jest.fn()
}));

describe('EventPublisher', () => {
  let mockNc;
  let mockSc;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockNc = {
      publish: jest.fn().mockResolvedValue(undefined)
    };

    mockSc = {
      encode: jest.fn().mockImplementation((data) => Buffer.from(data))
    };
    
    natsClient.getConnection.mockReturnValue(mockNc);
    natsClient.getCodec.mockReturnValue(mockSc);
  });

  describe('publish', () => {
    it('should publish event successfully', async () => {
      const subject = 'test.subject';
      const payload = { test: 'data' };

      const result = await eventPublisher.publish(subject, payload);

      expect(result).toBe(true);
      expect(mockNc.publish).toHaveBeenCalledWith(
        subject,
        expect.any(Buffer)
      );
      expect(mockSc.encode).toHaveBeenCalledWith(JSON.stringify(payload));
    });

    it('should return false when NATS is not connected', async () => {
      natsClient.getConnection.mockReturnValue(null);

      const result = await eventPublisher.publish('test', {});

      expect(result).toBe(false);
      expect(mockNc.publish).not.toHaveBeenCalled();
    });

    it('should return false on error', async () => {
      mockNc.publish.mockImplementation(() => {
        throw new Error('Connection error');
      });

      const result = await eventPublisher.publish('test', {});

      expect(result).toBe(false);
    });
  });

  describe('publishDeliveryStatusChanged', () => {
    it('should publish delivery status change event', async () => {
      const deliveryId = 123;
      const status = 'ENTREGUE';

      const result = await eventPublisher.publishDeliveryStatusChanged(
        deliveryId,
        status
      );

      expect(result).toBe(true);
      expect(mockNc.publish).toHaveBeenCalled();
      const publishedData = JSON.parse(
        mockSc.encode.mock.calls[0][0]
      );
      expect(publishedData).toMatchObject({
        deliveryId,
        status
      });
      expect(publishedData).toHaveProperty('timestamp');
    });
  });
});
