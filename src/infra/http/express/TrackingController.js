const container = require('../../../main/container');

class TrackingController {
  async getDeliveryTracking(req, res, next) {
    try {
      const { id } = req.params;
      const tracking = await container.trackingUseCases.getTracking.execute(parseInt(id));

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

      const deliveries = await container.trackingUseCases.listByStatus.execute(status);

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
      const deliveries = await container.trackingUseCases.listByStatus.execute(
        null,
        parseInt(driverId)
      );

      res.status(200).json({
        success: true,
        data: deliveries,
        total: deliveries.length
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDeliveryPosition(req, res, next) {
    try {
      const { id } = req.params;
      const { lat, lng } = req.body;

      const result = await container.trackingUseCases.updatePosition.execute(
        parseInt(id),
        { lat, lng }
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TrackingController();
