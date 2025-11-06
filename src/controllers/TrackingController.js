const TrackingService = require('../services/TrackingService');
const logger = require('../utils/logger');

class TrackingController {
  async getPosition(req, res, next) {
    try {
      const { deliveryId } = req.params;
      
      const position = await TrackingService.getPosition(deliveryId);
      
      res.json({
        success: true,
        data: {
          deliveryId,
          ...position
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePosition(req, res, next) {
    try {
      const { deliveryId } = req.params;
      const { lat, lng } = req.body;
      
      if (lat === undefined || lng === undefined) {
        const error = new Error('Latitude e longitude são obrigatórios');
        error.statusCode = 400;
        throw error;
      }
      
      // Validar coordenadas
      if (isNaN(lat) || isNaN(lng)) {
        const error = new Error('Latitude e longitude devem ser números');
        error.statusCode = 400;
        throw error;
      }
      
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        const error = new Error('Coordenadas fora dos limites válidos');
        error.statusCode = 400;
        throw error;
      }
      
      const position = await TrackingService.updatePosition(
        deliveryId, 
        parseFloat(lat), 
        parseFloat(lng)
      );
      
      res.json({
        success: true,
        data: {
          deliveryId,
          ...position
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TrackingController();
