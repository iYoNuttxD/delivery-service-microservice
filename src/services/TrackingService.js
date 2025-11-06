const logger = require('../utils/logger');

class TrackingService {
  constructor() {
    // In-memory storage for tracking data
    // In production, this could be backed by Redis or database
    this.trackingData = new Map();
  }

  async getPosition(deliveryId) {
    try {
      logger.info('🔍 Buscando posição de rastreamento', { deliveryId });
      
      const position = this.trackingData.get(deliveryId);
      
      if (!position) {
        const error = new Error('Posição de rastreamento não encontrada');
        error.statusCode = 404;
        throw error;
      }
      
      return position;
    } catch (error) {
      logger.error('❌ Erro ao buscar posição', { 
        deliveryId, 
        error: error.message 
      });
      throw error;
    }
  }

  async updatePosition(deliveryId, lat, lng) {
    try {
      logger.info('📍 Atualizando posição de rastreamento', { 
        deliveryId, 
        lat, 
        lng 
      });
      
      const position = {
        lat,
        lng,
        updatedAt: new Date().toISOString()
      };
      
      this.trackingData.set(deliveryId, position);
      
      return position;
    } catch (error) {
      logger.error('❌ Erro ao atualizar posição', { 
        deliveryId, 
        error: error.message 
      });
      throw error;
    }
  }

  async deletePosition(deliveryId) {
    try {
      logger.info('🗑️ Removendo posição de rastreamento', { deliveryId });
      this.trackingData.delete(deliveryId);
    } catch (error) {
      logger.error('❌ Erro ao remover posição', { 
        deliveryId, 
        error: error.message 
      });
      throw error;
    }
  }

  async getAllPositions() {
    try {
      logger.info('📋 Listando todas as posições');
      const positions = {};
      
      for (const [deliveryId, position] of this.trackingData.entries()) {
        positions[deliveryId] = position;
      }
      
      return positions;
    } catch (error) {
      logger.error('❌ Erro ao listar posições', { error: error.message });
      throw error;
    }
  }
}

module.exports = new TrackingService();
