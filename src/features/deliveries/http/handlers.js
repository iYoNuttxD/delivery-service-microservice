const container = require('../../../main/container');

class DeliveryHandlers {
  async getAll(req, res, next) {
    try {
      const { entregadorId, status, pedidoId } = req.query;
      const filters = {};

      if (entregadorId) filters.entregadorId = parseInt(entregadorId);
      if (status) filters.status = status;
      if (pedidoId) filters.pedidoId = pedidoId;

      const deliveries = await container.deliveryUseCases.list.execute(filters);

      res.status(200).json({
        success: true,
        data: deliveries,
        total: deliveries.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const delivery = await container.deliveryUseCases.getById.execute(parseInt(id));

      res.status(200).json({
        success: true,
        data: delivery
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const data = {
        pedidoId: req.body.pedidoId,
        entregadorId: req.body.entregadorId,
        aluguelId: req.body.aluguelId,
        enderecoColeta: req.body.enderecoColeta,
        enderecoEntrega: req.body.enderecoEntrega,
        taxaEntrega: req.body.taxaEntrega
      };

      const delivery = await container.deliveryUseCases.create.execute(data);

      res.status(201).json({
        success: true,
        message: 'Entrega criada com sucesso',
        data: delivery
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const delivery = await container.deliveryUseCases.updateStatus.execute(
        parseInt(id),
        status
      );

      res.status(200).json({
        success: true,
        message: 'Status atualizado com sucesso',
        data: delivery
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DeliveryHandlers();
