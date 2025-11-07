// Placeholder for updating delivery tracking position
// This would integrate with GPS/location services
class UpdateDeliveryTrackingPosition {
  constructor(deliveryRepository, logger) {
    this.deliveryRepository = deliveryRepository;
    this.logger = logger;
  }

  async execute(deliveryId, position) {
    try {
      this.logger.info('Updating delivery tracking position', { deliveryId, position });

      // Verify delivery exists
      const delivery = await this.deliveryRepository.findById(deliveryId);

      if (!delivery) {
        const error = new Error('Entrega não encontrada');
        error.statusCode = 404;
        throw error;
      }

      // In a real implementation, this would update a location tracking table
      // For now, just log and return success
      this.logger.info('Delivery position updated', {
        deliveryId,
        lat: position.lat,
        lng: position.lng
      });

      return {
        deliveryId: delivery.Id,
        position: {
          lat: position.lat,
          lng: position.lng,
          timestamp: new Date()
        }
      };
    } catch (error) {
      this.logger.error('Error updating delivery position', {
        deliveryId,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = UpdateDeliveryTrackingPosition;
