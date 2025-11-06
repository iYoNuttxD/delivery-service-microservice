const mapIntegrationAdapter = require('../../src/infra/maps/mapIntegrationAdapter');
const axios = require('axios');

jest.mock('axios');

describe('MapIntegrationAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Save original env
    this.originalMapsApiKey = process.env.MAPS_API_KEY;
  });

  afterEach(() => {
    // Restore original env
    if (this.originalMapsApiKey) {
      process.env.MAPS_API_KEY = this.originalMapsApiKey;
    } else {
      delete process.env.MAPS_API_KEY;
    }
  });

  describe('getETA', () => {
    it('should return mock ETA when API key is not set', async () => {
      delete process.env.MAPS_API_KEY;

      const result = await mapIntegrationAdapter.getETA(
        'Origin Address',
        'Destination Address'
      );

      expect(result).toHaveProperty('distance');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('mock', true);
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('should call Maps API when key is set', async () => {
      process.env.MAPS_API_KEY = 'test-api-key';

      axios.get.mockResolvedValue({
        data: {
          status: 'OK',
          rows: [
            {
              elements: [
                {
                  status: 'OK',
                  distance: { value: 10000, text: '10.0 km' },
                  duration: { value: 1200, text: '20 min' },
                  duration_in_traffic: { value: 1440, text: '24 min' }
                }
              ]
            }
          ]
        }
      });

      const result = await mapIntegrationAdapter.getETA(
        'Origin',
        'Destination'
      );

      expect(result).toHaveProperty('distance');
      expect(result.distance.value).toBe(10000);
      expect(result).toHaveProperty('duration');
      expect(result.duration.value).toBe(1200);
      expect(result).toHaveProperty('durationInTraffic');
      expect(axios.get).toHaveBeenCalled();
    });

    it('should return mock data on API error', async () => {
      process.env.MAPS_API_KEY = 'test-api-key';
      axios.get.mockRejectedValue(new Error('API error'));

      const result = await mapIntegrationAdapter.getETA(
        'Origin',
        'Destination'
      );

      expect(result).toHaveProperty('mock', true);
    });

    it('should handle non-OK status from API', async () => {
      process.env.MAPS_API_KEY = 'test-api-key';
      axios.get.mockResolvedValue({
        data: { status: 'INVALID_REQUEST' }
      });

      const result = await mapIntegrationAdapter.getETA(
        'Origin',
        'Destination'
      );

      expect(result).toHaveProperty('mock', true);
    });
  });

  describe('getRoute', () => {
    it('should return mock route when API key is not set', async () => {
      delete process.env.MAPS_API_KEY;

      const result = await mapIntegrationAdapter.getRoute(
        'Origin',
        'Destination'
      );

      expect(result).toHaveProperty('steps');
      expect(result).toHaveProperty('mock', true);
    });

    it('should call Maps API when key is set', async () => {
      process.env.MAPS_API_KEY = 'test-api-key';

      axios.get.mockResolvedValue({
        data: {
          status: 'OK',
          routes: [
            {
              legs: [
                {
                  distance: { value: 10000, text: '10.0 km' },
                  duration: { value: 1200, text: '20 min' },
                  start_address: 'Start Address',
                  end_address: 'End Address',
                  steps: [
                    {
                      html_instructions: '<b>Turn left</b> onto Main St',
                      distance: { value: 500, text: '500 m' },
                      duration: { value: 60, text: '1 min' }
                    }
                  ]
                }
              ]
            }
          ]
        }
      });

      const result = await mapIntegrationAdapter.getRoute(
        'Origin',
        'Destination'
      );

      expect(result).toHaveProperty('steps');
      expect(result.steps[0].instruction).toBe('Turn left onto Main St');
      expect(result).not.toHaveProperty('mock');
      expect(axios.get).toHaveBeenCalled();
    });

    it('should return mock route on API error', async () => {
      process.env.MAPS_API_KEY = 'test-api-key';
      axios.get.mockRejectedValue(new Error('API error'));

      const result = await mapIntegrationAdapter.getRoute(
        'Origin',
        'Destination'
      );

      expect(result).toHaveProperty('mock', true);
    });
  });
});
