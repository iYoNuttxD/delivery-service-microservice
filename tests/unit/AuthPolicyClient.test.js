const authPolicyClient = require('../../src/infra/opa/authPolicyClient');
const axios = require('axios');

jest.mock('axios');

describe('AuthPolicyClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('evaluate', () => {
    it('should return true when policy allows', async () => {
      axios.post.mockResolvedValue({
        data: { result: true }
      });

      const input = { user: 'user123', action: 'read' };
      const result = await authPolicyClient.evaluate(input);

      expect(result).toBe(true);
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/v1/data/delivery/allow'),
        { input },
        expect.any(Object)
      );
    });

    it('should return false when policy denies', async () => {
      axios.post.mockResolvedValue({
        data: { result: false }
      });

      const result = await authPolicyClient.evaluate({ user: 'user456' });

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      axios.post.mockRejectedValue(new Error('Network error'));

      const result = await authPolicyClient.evaluate({ user: 'user789' });

      expect(result).toBe(false);
    });

    it('should return false when result is undefined', async () => {
      axios.post.mockResolvedValue({ data: {} });

      const result = await authPolicyClient.evaluate({ user: 'user000' });

      expect(result).toBe(false);
    });
  });

  describe('canAccessDelivery', () => {
    it('should evaluate delivery access correctly', async () => {
      axios.post.mockResolvedValue({
        data: { result: true }
      });

      const result = await authPolicyClient.canAccessDelivery(
        'user123',
        'delivery456',
        'read'
      );

      expect(result).toBe(true);
      expect(axios.post).toHaveBeenCalled();
    });
  });

  describe('canPerformAction', () => {
    it('should evaluate general action correctly', async () => {
      axios.post.mockResolvedValue({
        data: { result: true }
      });

      const result = await authPolicyClient.canPerformAction(
        'user123',
        'delivery',
        'create'
      );

      expect(result).toBe(true);
    });
  });
});
