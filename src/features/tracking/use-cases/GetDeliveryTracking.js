class GetDeliveryTracking {
  constructor(deliveryRepository, logger) {
    this.deliveryRepository = deliveryRepository;
    this.logger = logger;
  }

  async execute(deliveryId) {
    try {
      this.logger.info('Getting delivery tracking', { deliveryId });

      const delivery = await this.deliveryRepository.findById(deliveryId);

      if (!delivery) {
        const error = new Error('Entrega não encontrada');
        error.statusCode = 404;
        throw error;
      }

      // Build tracking information
      const tracking = {
        deliveryId: delivery.Id,
        pedidoId: delivery.PedidoId,
        status: delivery.Status,
        currentLocation: null,
        timeline: this.buildTimeline(delivery),
        estimatedDeliveryTime: this.calculateEstimatedDeliveryTime(delivery),
        driver: {
          id: delivery.EntregadorId,
          name: delivery.EntregadorNome
        }
      };

      this.logger.info('Delivery tracking retrieved successfully', { deliveryId });
      return tracking;
    } catch (error) {
      this.logger.error('Error getting delivery tracking', {
        deliveryId,
        error: error.message
      });
      throw error;
    }
  }

  buildTimeline(delivery) {
    const timeline = [];

    timeline.push({
      status: 'PENDENTE',
      timestamp: delivery.CreatedAt,
      description: 'Entrega criada'
    });

    if (delivery.Status !== 'PENDENTE') {
      timeline.push({
        status: 'ATRIBUIDA',
        timestamp: delivery.UpdatedAt,
        description: 'Entrega atribuída ao entregador'
      });
    }

    if (delivery.HoraColeta) {
      timeline.push({
        status: 'COLETADA',
        timestamp: delivery.HoraColeta,
        description: 'Pedido coletado'
      });
    }

    if (delivery.Status === 'EM_TRANSITO') {
      timeline.push({
        status: 'EM_TRANSITO',
        timestamp: delivery.UpdatedAt,
        description: 'Em rota de entrega'
      });
    }

    if (delivery.HoraEntrega) {
      timeline.push({
        status: 'ENTREGUE',
        timestamp: delivery.HoraEntrega,
        description: 'Entrega concluída'
      });
    }

    if (delivery.Status === 'CANCELADA') {
      timeline.push({
        status: 'CANCELADA',
        timestamp: delivery.UpdatedAt,
        description: 'Entrega cancelada'
      });
    }

    return timeline;
  }

  calculateEstimatedDeliveryTime(delivery) {
    if (delivery.Status === 'ENTREGUE') {
      return delivery.HoraEntrega;
    }

    if (delivery.Status === 'CANCELADA') {
      return null;
    }

    // Simple estimation: 1 hour from collection
    if (delivery.HoraColeta) {
      const estimatedTime = new Date(delivery.HoraColeta);
      estimatedTime.setHours(estimatedTime.getHours() + 1);
      return estimatedTime;
    }

    // If not collected yet, estimate 2 hours from now
    const estimatedTime = new Date();
    estimatedTime.setHours(estimatedTime.getHours() + 2);
    return estimatedTime;
  }
}

module.exports = GetDeliveryTracking;
