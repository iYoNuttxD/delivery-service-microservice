const axios = require('axios');
const logger = require('../../utils/logger');

class MapIntegrationAdapter {
  constructor() {
    this.apiUrl = process.env.MAPS_API_URL || 'https://maps.googleapis.com/maps/api';
  }

  getApiKey() {
    return process.env.MAPS_API_KEY || '';
  }

  async getETA(origin, destination) {
    try {
      const apiKey = this.getApiKey();
      
      if (!apiKey) {
        logger.warn('⚠️ MAPS_API_KEY não configurada, retornando valores simulados');
        return this._getMockETA(origin, destination);
      }

      logger.info('🗺️ Buscando ETA no serviço de mapas', { origin, destination });

      // Usando Distance Matrix API do Google Maps como exemplo
      const url = `${this.apiUrl}/distancematrix/json`;
      const response = await axios.get(url, {
        params: {
          origins: origin,
          destinations: destination,
          key: apiKey,
          mode: 'driving',
          departure_time: 'now'
        },
        timeout: 10000
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Maps API error: ${response.data.status}`);
      }

      const result = response.data.rows[0]?.elements[0];
      
      if (result?.status !== 'OK') {
        throw new Error(`Route calculation failed: ${result?.status}`);
      }

      const eta = {
        distance: {
          value: result.distance.value, // em metros
          text: result.distance.text
        },
        duration: {
          value: result.duration.value, // em segundos
          text: result.duration.text
        },
        durationInTraffic: result.duration_in_traffic ? {
          value: result.duration_in_traffic.value,
          text: result.duration_in_traffic.text
        } : null
      };

      logger.info('✅ ETA calculado', { eta });
      return eta;
    } catch (error) {
      logger.error('❌ Erro ao buscar ETA', { 
        error: error.message,
        origin,
        destination
      });
      
      // Fallback para valores simulados em caso de erro
      return this._getMockETA(origin, destination);
    }
  }

  async getRoute(origin, destination) {
    try {
      const apiKey = this.getApiKey();
      
      if (!apiKey) {
        logger.warn('⚠️ MAPS_API_KEY não configurada, retornando rota simulada');
        return this._getMockRoute(origin, destination);
      }

      logger.info('🗺️ Buscando rota no serviço de mapas', { origin, destination });

      const url = `${this.apiUrl}/directions/json`;
      const response = await axios.get(url, {
        params: {
          origin,
          destination,
          key: apiKey,
          mode: 'driving',
          alternatives: false
        },
        timeout: 10000
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Maps API error: ${response.data.status}`);
      }

      const route = response.data.routes[0];
      const leg = route.legs[0];

      return {
        distance: leg.distance,
        duration: leg.duration,
        startAddress: leg.start_address,
        endAddress: leg.end_address,
        steps: leg.steps.map(step => ({
          instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
          distance: step.distance,
          duration: step.duration
        }))
      };
    } catch (error) {
      logger.error('❌ Erro ao buscar rota', { 
        error: error.message,
        origin,
        destination
      });
      return this._getMockRoute(origin, destination);
    }
  }

  _getMockETA(origin, destination) {
    // Simula um cálculo simples de ETA
    const baseDistance = 10000; // 10km
    const baseTime = 1200; // 20 minutos
    
    return {
      distance: {
        value: baseDistance,
        text: `${(baseDistance / 1000).toFixed(1)} km`
      },
      duration: {
        value: baseTime,
        text: `${Math.round(baseTime / 60)} min`
      },
      durationInTraffic: {
        value: baseTime * 1.2,
        text: `${Math.round((baseTime * 1.2) / 60)} min`
      },
      mock: true
    };
  }

  _getMockRoute(origin, destination) {
    return {
      distance: { value: 10000, text: '10.0 km' },
      duration: { value: 1200, text: '20 min' },
      startAddress: origin,
      endAddress: destination,
      steps: [
        {
          instruction: 'Siga em frente',
          distance: { value: 10000, text: '10.0 km' },
          duration: { value: 1200, text: '20 min' }
        }
      ],
      mock: true
    };
  }
}

module.exports = new MapIntegrationAdapter();
