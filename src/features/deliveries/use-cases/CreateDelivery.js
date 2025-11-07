const Entrega = require('../../../domain/entities/Entrega');
const DeliveryCreated = require('../../../domain/events/DeliveryCreated');

class CreateDelivery {
  constructor(deliveryRepository, rentalRepository, messageBus, logger, metrics) {
    this.deliveryRepository = deliveryRepository;
    this.rentalRepository = rentalRepository;
    this.messageBus = messageBus;
    this.logger = logger;
    this.metrics = metrics;
  }

  async execute(data) {
    try {
      this.logger.info('Creating new delivery', data);

      // Verify rental exists and is active
      const rental = await this.rentalRepository.findById(data.aluguelId);
      if (!rental) {
        const error = new Error('Aluguel não encontrado');
        error.statusCode = 404;
        throw error;
      }

      if (rental.Status !== 'ATIVO') {
        const error = new Error('Aluguel não está ativo');
        error.statusCode = 400;
        throw error;
      }

      // Create delivery
      const deliveryData = await this.deliveryRepository.create(data);
      const delivery = new Entrega(this.mapFromDb(deliveryData));

      this.logger.info('Delivery created successfully', { id: delivery.id });

      // Publish delivery created event
      const event = new DeliveryCreated(delivery);
      await this.messageBus.publish(
        process.env.DELIVERY_CREATED_SUBJECT || 'delivery.created',
        event.toPayload()
      );

      return delivery;
    } catch (error) {
      this.logger.error('Error creating delivery', { error: error.message });
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

module.exports = CreateDelivery;
