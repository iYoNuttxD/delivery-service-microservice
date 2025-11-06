const axios = require('axios');
const logger = require('../../utils/logger');

class MapIntegrationAdapter {
  constructor() {
    this.mapServiceUrl = process.env.MAP_SERVICE_URL;
    this.mapApiKey = process.env.MAP_API_KEY;
    this.enabled = !!this.mapServiceUrl;
    this.timeout = parseInt(process.env.MAP_SERVICE_TIMEOUT, 10) || 10000;
    this.provider = process.env.MAP_PROVIDER || 'generic'; // generic, google, azure-maps, etc.
    
    if (!this.enabled) {
      logger.info('MAP_SERVICE_URL não configurado. Integração de mapa desabilitada.');
    } else {
      logger.info('Integração de mapa configurada', { 
        provider: this.provider,
        url: this.mapServiceUrl 
      });
    }
  }

  async calculateRoute(origin, destination) {
    if (!this.enabled) {
      logger.debug('Serviço de mapa desabilitado. Retornando rota mock.');
      return this.getMockRoute(origin, destination);
    }

    try {
      logger.debug('Calculando rota', { origin, destination });

      const response = await axios.post(
        `${this.mapServiceUrl}/route`,
        {
          origin,
          destination,
          provider: this.provider
        },
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json',
            ...(this.mapApiKey && { 'X-API-Key': this.mapApiKey })
          }
        }
      );

      logger.debug('Rota calculada com sucesso', { 
        distance: response.data?.distance,
        duration: response.data?.duration 
      });

      return {
        distance: response.data?.distance,
        duration: response.data?.duration,
        polyline: response.data?.polyline,
        steps: response.data?.steps
      };
    } catch (error) {
      logger.error('Erro ao calcular rota', { 
        origin,
        destination,
        error: error.message 
      });
      
      // Return mock data on error
      return this.getMockRoute(origin, destination);
    }
  }

  async geocodeAddress(address) {
    if (!this.enabled) {
      logger.debug('Serviço de mapa desabilitado. Retornando coordenadas mock.');
      return this.getMockCoordinates(address);
    }

    try {
      logger.debug('Geocodificando endereço', { address });

      const response = await axios.get(
        `${this.mapServiceUrl}/geocode`,
        {
          params: {
            address,
            provider: this.provider
          },
          timeout: this.timeout,
          headers: {
            ...(this.mapApiKey && { 'X-API-Key': this.mapApiKey })
          }
        }
      );

      logger.debug('Endereço geocodificado com sucesso', { 
        address,
        coordinates: response.data?.coordinates 
      });

      return {
        latitude: response.data?.coordinates?.latitude,
        longitude: response.data?.coordinates?.longitude,
        formattedAddress: response.data?.formattedAddress
      };
    } catch (error) {
      logger.error('Erro ao geocodificar endereço', { 
        address,
        error: error.message 
      });
      
      return this.getMockCoordinates(address);
    }
  }

  async reverseGeocode(latitude, longitude) {
    if (!this.enabled) {
      logger.debug('Serviço de mapa desabilitado. Retornando endereço mock.');
      return { address: `Lat: ${latitude}, Lng: ${longitude}` };
    }

    try {
      logger.debug('Geocodificação reversa', { latitude, longitude });

      const response = await axios.get(
        `${this.mapServiceUrl}/reverse-geocode`,
        {
          params: {
            latitude,
            longitude,
            provider: this.provider
          },
          timeout: this.timeout,
          headers: {
            ...(this.mapApiKey && { 'X-API-Key': this.mapApiKey })
          }
        }
      );

      logger.debug('Geocodificação reversa concluída', { 
        address: response.data?.address 
      });

      return {
        address: response.data?.address,
        city: response.data?.city,
        state: response.data?.state,
        country: response.data?.country
      };
    } catch (error) {
      logger.error('Erro na geocodificação reversa', { 
        latitude,
        longitude,
        error: error.message 
      });
      
      return { address: `Lat: ${latitude}, Lng: ${longitude}` };
    }
  }

  async calculateETA(origin, destination) {
    const route = await this.calculateRoute(origin, destination);
    
    if (!route || !route.duration) {
      // Default ETA: 1 hour
      return {
        eta: new Date(Date.now() + 60 * 60 * 1000),
        duration: 60 * 60,
        distance: null
      };
    }

    const etaTimestamp = new Date(Date.now() + route.duration * 1000);
    
    return {
      eta: etaTimestamp,
      duration: route.duration,
      distance: route.distance
    };
  }

  getMockRoute(origin, destination) {
    // Return mock data when service is not available
    return {
      distance: 5000, // 5km in meters
      duration: 900, // 15 minutes in seconds
      polyline: null,
      steps: []
    };
  }

  getMockCoordinates(address) {
    // Return mock coordinates (São Paulo center as default)
    return {
      latitude: -23.5505,
      longitude: -46.6333,
      formattedAddress: address
    };
  }

  isEnabled() {
    return this.enabled;
  }

  getStatus() {
    return {
      enabled: this.enabled,
      provider: this.provider,
      url: this.enabled ? this.mapServiceUrl : null
    };
  }
}

module.exports = new MapIntegrationAdapter();
