const Entrega = require('../../domain/entities/Entrega');

class ListDeliveries {
  constructor(deliveryRepository, logger) {
    this.deliveryRepository = deliveryRepository;
    this.logger = logger;
  }

  async execute(filters = {}) {
    try {
      this.logger.info('Listing deliveries', { filters });

      const deliveriesData = await this.deliveryRepository.findAll(filters);

      const deliveries = deliveriesData.map(data => new Entrega(this.mapFromDb(data)));

      return deliveries;
    } catch (error) {
      this.logger.error('Error listing deliveries', { error: error.message });
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

module.exports = ListDeliveries;
