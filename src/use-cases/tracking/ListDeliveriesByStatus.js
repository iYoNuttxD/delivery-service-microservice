const ACTIVE_DELIVERY_STATUSES = ['ATRIBUIDA', 'COLETADA', 'EM_TRANSITO'];

class ListDeliveriesByStatus {
  constructor(deliveryRepository, logger) {
    this.deliveryRepository = deliveryRepository;
    this.logger = logger;
  }

  async execute(status, driverId = null) {
    try {
      this.logger.info('Listing deliveries by status', { status, driverId });

      const filters = { status };
      if (driverId) {
        filters.entregadorId = driverId;
      }

      const deliveries = await this.deliveryRepository.findAll(filters);

      // Filter active deliveries if needed
      let filtered = deliveries;
      if (driverId && !status) {
        filtered = deliveries.filter(d =>
          ACTIVE_DELIVERY_STATUSES.includes(d.Status)
        );
      }

      return filtered.map(delivery => ({
        deliveryId: delivery.Id,
        pedidoId: delivery.PedidoId,
        status: delivery.Status,
        entregadorId: delivery.EntregadorId,
        entregadorNome: delivery.EntregadorNome,
        enderecoColeta: delivery.EnderecoColeta,
        enderecoEntrega: delivery.EnderecoEntrega,
        horaColeta: delivery.HoraColeta,
        createdAt: delivery.CreatedAt
      }));
    } catch (error) {
      this.logger.error('Error listing deliveries by status', {
        status,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = ListDeliveriesByStatus;
