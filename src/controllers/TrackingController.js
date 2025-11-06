const TrackingService = require('../services/TrackingService');
const logger = require('../utils/logger');

class TrackingController {
  async getDeliveryTracking(req, res, next) {
    try {
      const { id } = req.params;
      const tracking = await TrackingService.getDeliveryTracking(id);
      
      res.status(200).json({
        success: true,
        data: tracking
      });
    } catch (error) {
      next(error);
    }
  }

  async getDeliveriesByStatus(req, res, next) {
    try {
      const { status } = req.query;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status é obrigatório'
        });
      }

      const deliveries = await TrackingService.getDeliveriesByStatus(status);
      
      res.status(200).json({
        success: true,
        data: deliveries,
        total: deliveries.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getDriverActiveDeliveries(req, res, next) {
    try {
      const { driverId } = req.params;
      const deliveries = await TrackingService.getDriverActiveDeliveries(driverId);
      
      res.status(200).json({
        success: true,
        data: deliveries,
        total: deliveries.length
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TrackingController();
