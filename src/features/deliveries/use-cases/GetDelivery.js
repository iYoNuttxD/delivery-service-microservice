const Entrega = require('../../../domain/entities/Entrega');

class GetDelivery {
  constructor(deliveryRepository, logger) {
    this.deliveryRepository = deliveryRepository;
    this.logger = logger;
  }

  async execute(id) {
    try {
      this.logger.info('Getting delivery by ID', { id });

      const deliveryData = await this.deliveryRepository.findById(id);

      if (!deliveryData) {
        const error = new Error('Entrega não encontrada');
        error.statusCode = 404;
        throw error;
      }

      const delivery = new Entrega(this.mapFromDb(deliveryData));

      return delivery;
    } catch (error) {
      this.logger.error('Error getting delivery', { id, error: error.message });
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

module.exports = GetDelivery;
