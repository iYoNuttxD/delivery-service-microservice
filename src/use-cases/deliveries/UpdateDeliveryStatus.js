const Entrega = require('../../domain/entities/Entrega');
const DeliveryStatusChanged = require('../../domain/events/DeliveryStatusChanged');
const DeliveryCompleted = require('../../domain/events/DeliveryCompleted');

class UpdateDeliveryStatus {
  constructor(deliveryRepository, messageBus, logger, metrics) {
    this.deliveryRepository = deliveryRepository;
    this.messageBus = messageBus;
    this.logger = logger;
    this.metrics = metrics;
  }

  async execute(id, newStatus) {
    try {
      this.logger.info('Updating delivery status', { id, newStatus });

      // Get current delivery
      const deliveryData = await this.deliveryRepository.findById(id);
      if (!deliveryData) {
        const error = new Error('Entrega não encontrada');
        error.statusCode = 404;
        throw error;
      }

      const delivery = new Entrega(this.mapFromDb(deliveryData));
      const oldStatus = delivery.status;

      // Use domain logic to validate and update status
      delivery.updateStatus(newStatus);

      // Prepare additional data for timestamps
      const additionalData = {};
      if (delivery.horaColeta) {
        additionalData.horaColeta = delivery.horaColeta;
      }
      if (delivery.horaEntrega) {
        additionalData.horaEntrega = delivery.horaEntrega;
      }

      // Persist changes
      const updatedData = await this.deliveryRepository.updateStatus(
        id,
        newStatus,
        additionalData
      );

      const updatedDelivery = new Entrega(this.mapFromDb(updatedData));

      this.logger.info('Delivery status updated successfully', { id, newStatus });

      // Publish status changed event
      const statusEvent = new DeliveryStatusChanged(id, oldStatus, newStatus, additionalData);
      await this.messageBus.publish(
        process.env.DELIVERY_STATUS_SUBJECT || 'delivery.status.changed',
        statusEvent.toPayload()
      );

      // Record metrics
      if (this.metrics && this.metrics.recordDeliveryStatusChange) {
        this.metrics.recordDeliveryStatusChange(oldStatus, newStatus);
      }

      // Publish completed event if delivered
      if (updatedDelivery.isCompleted()) {
        const completedEvent = new DeliveryCompleted(updatedDelivery);
        await this.messageBus.publish(
          process.env.DELIVERY_COMPLETED_SUBJECT || 'delivery.completed',
          completedEvent.toPayload()
        );
      }

      return updatedDelivery;
    } catch (error) {
      this.logger.error('Error updating delivery status', { id, error: error.message });
      throw error;
    }
  }

  mapFromDb(data) {
    return {
      id: data.Id,
      pedidoId: data.PedidoId,
      entregadorId: data.EntregadorId,
      aluguelId: data.AluguelId,
      enderecoColeta: data.EnderecoColeta,
      enderecoEntrega: data.EnderecoEntrega,
      taxaEntrega: data.TaxaEntrega,
      status: data.Status,
      horaColeta: data.HoraColeta,
      horaEntrega: data.HoraEntrega,
      createdAt: data.CreatedAt,
      updatedAt: data.UpdatedAt
    };
  }
}

module.exports = UpdateDeliveryStatus;
